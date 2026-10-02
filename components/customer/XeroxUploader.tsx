'use client';

import { useState, useRef, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Upload, X, FileText, Image as ImageIcon, Crop as CropIcon, RotateCw, Plus, Minus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Orientation = 'portrait' | 'landscape';
type ColorMode = 'bw' | 'color';
const PAGE_SIZES = ['A4', 'A3', 'Letter', 'Legal'];

interface LocalFile {
  id: string;
  file: File;
  previewUrl: string;
  isImage: boolean;
  copies: number;
  orientation: Orientation;
  pageSize: string;
  colorMode: ColorMode;
  croppedAreaPixels: Area | null;
}

export default function XeroxUploader() {
  const { addPrintItemsToCart, showToast, setCartOpen } = useApp();
  const { isDark } = useTheme();
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [cropTarget, setCropTarget] = useState<LocalFile | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: LocalFile[] = Array.from(fileList).map(file => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      isImage: file.type.startsWith('image/'),
      copies: 1,
      orientation: 'portrait',
      pageSize: 'A4',
      colorMode: 'bw',
      croppedAreaPixels: null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const updateFile = (id: string, patch: Partial<LocalFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    if (cropTarget) {
      setCropTarget(prev => prev ? { ...prev, croppedAreaPixels } : prev);
    }
  }, [cropTarget]);

  const saveCrop = () => {
    if (cropTarget) {
      updateFile(cropTarget.id, { croppedAreaPixels: cropTarget.croppedAreaPixels });
      showToast('✅ Crop saved');
    }
    setCropTarget(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Apply the saved crop to a File by drawing onto a canvas, returning a new File
  const applyCrop = async (localFile: LocalFile): Promise<File> => {
    if (!localFile.isImage || !localFile.croppedAreaPixels) return localFile.file;

    const imgUrl = localFile.previewUrl;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imgUrl;
    });

    const { x, y, width, height } = localFile.croppedAreaPixels;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return localFile.file;
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(localFile.file); return; }
        resolve(new File([blob], localFile.file.name, { type: localFile.file.type }));
      }, localFile.file.type, 0.95);
    });
  };

  const totalCopies = files.reduce((s, f) => s + f.copies, 0);

  const handleAddAllToCart = async () => {
    if (files.length === 0) {
      showToast('❌ Please upload at least one file');
      return;
    }

    setUploading(true);
    try {
      // Fetch the base Xerox product to get price-per-copy and base fields
      const catalogRes = await fetch(`${API_URL}/catalog`);
      const catalogData = await catalogRes.json();
      const baseProduct = catalogData.products?.find(
        (p: any) => (p.category || '').trim().toLowerCase() === 'xerox'
      );
      if (!baseProduct) {
        showToast('❌ Printing service is not set up yet. Please contact the store.');
        setUploading(false);
        return;
      }

      // Apply crops, then upload all files in one batch
      const processedFiles = await Promise.all(files.map(applyCrop));
      const formData = new FormData();
      processedFiles.forEach(f => formData.append('files', f));

      const uploadRes = await fetch(`${API_URL}/upload/print`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        showToast(`❌ ${uploadData.message || 'Upload failed'}`);
        setUploading(false);
        return;
      }

      // Build one cart line per uploaded file, carrying print metadata
      const newCartItems = uploadData.files.map((uploaded: any, idx: number) => {
        const local = files[idx];
        return {
          ...baseProduct,
          _id: `${baseProduct._id}-print-${uploaded.public_id}`,
          name: `Print: ${local.file.name}`,
          image: uploaded.resourceType === 'image' ? uploaded.url : baseProduct.image,
          qty: local.copies,
          printFile: {
            fileUrl: uploaded.url,
            fileName: uploaded.originalName,
            fileType: uploaded.mimeType,
            resourceType: uploaded.resourceType,
            orientation: local.orientation,
            pageSize: local.pageSize,
            colorMode: local.colorMode,
          },
        };
      });

      addPrintItemsToCart(newCartItems);

      setFiles([]);
      showToast(`✅ ${newCartItems.length} file(s) added to cart!`);
      setCartOpen(true);
    } catch (error) {
      console.error('Print upload error:', error);
      showToast('❌ Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
      <h3 className={`text-xl font-black mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        🖨️ Xerox / Printing Service
      </h3>
      <p className={`text-sm mb-5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Upload photos or documents — set copies, orientation, and page size for each.
      </p>

      {/* Upload dropzone */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={e => handleFilesSelected(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={`w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
          isDark ? 'border-[#2d2450] text-gray-400 hover:border-indigo-500/50 hover:bg-indigo-500/5' : 'border-orange-200 text-gray-500 hover:border-orange-400 hover:bg-orange-50/50'
        }`}
      >
        <Upload size={28} />
        <span className="font-bold text-sm">Tap to upload images or documents</span>
        <span className="text-xs opacity-70">JPG, PNG, PDF, DOC, DOCX — up to 15MB each</span>
      </button>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-5 space-y-3">
          {files.map(f => (
            <div key={f.id} className={`rounded-2xl border p-3 flex gap-3 ${isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-orange-50/40 border-orange-100'}`}>
              {/* Thumbnail / icon */}
              <div className={`w-16 h-16 shrink-0 rounded-xl border overflow-hidden flex items-center justify-center ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-gray-100'}`}>
                {f.isImage ? (
                  <img src={f.previewUrl} alt={f.file.name} className="w-full h-full object-cover" />
                ) : (
                  <FileText size={24} className={isDark ? 'text-indigo-400' : 'text-orange-400'} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{f.file.name}</p>
                  <button onClick={() => removeFile(f.id)} className="shrink-0 text-red-500 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* Copies stepper */}
                  <div className={`flex items-center border rounded-lg ${isDark ? 'border-[#2d2450]' : 'border-orange-200'}`}>
                    <button onClick={() => updateFile(f.id, { copies: Math.max(1, f.copies - 1) })} className="p-1.5"><Minus size={12} /></button>
                    <span className="text-xs font-bold w-6 text-center">{f.copies}</span>
                    <button onClick={() => updateFile(f.id, { copies: f.copies + 1 })} className="p-1.5"><Plus size={12} /></button>
                  </div>

                  {/* Orientation */}
                  <button
                    onClick={() => updateFile(f.id, { orientation: f.orientation === 'portrait' ? 'landscape' : 'portrait' })}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${isDark ? 'border-[#2d2450] text-gray-400' : 'border-orange-200 text-gray-500'}`}
                  >
                    <RotateCw size={11} /> {f.orientation}
                  </button>

                  {/* Page size */}
                  <select
                    value={f.pageSize}
                    onChange={e => updateFile(f.id, { pageSize: e.target.value })}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-300' : 'bg-white border-orange-200 text-gray-600'}`}
                  >
                    {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>

                  {/* Color mode */}
                  <select
                    value={f.colorMode}
                    onChange={e => updateFile(f.id, { colorMode: e.target.value as ColorMode })}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none ${isDark ? 'bg-[#1a1535] border-[#2d2450] text-gray-300' : 'bg-white border-orange-200 text-gray-600'}`}
                  >
                    <option value="bw">B&W</option>
                    <option value="color">Color</option>
                  </select>

                  {/* Crop — images only */}
                  {f.isImage && (
                    <button
                      onClick={() => { setCropTarget(f); setCrop({ x: 0, y: 0 }); setZoom(1); }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${f.croppedAreaPixels ? 'bg-emerald-500 text-white border-emerald-500' : (isDark ? 'border-[#2d2450] text-gray-400' : 'border-orange-200 text-gray-500')}`}
                    >
                      <CropIcon size={11} /> {f.croppedAreaPixels ? 'Cropped' : 'Crop'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <span className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total copies: {totalCopies}
            </span>
            <button
              onClick={handleAddAllToCart}
              disabled={uploading}
              className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all disabled:opacity-60 ${
                isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500'
              }`}
            >
              {uploading ? 'Uploading…' : `Add to Cart (${files.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Crop modal */}
      {cropTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
          <div className={`w-full max-w-lg rounded-3xl overflow-hidden ${isDark ? 'bg-[#1a1535]' : 'bg-white'}`}>
            <div className="relative h-96">
              <Cropper
                image={cropTarget.previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={cropTarget.orientation === 'portrait' ? 3 / 4 : 4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <button onClick={() => setCropTarget(null)} className="px-4 py-2 rounded-xl font-bold text-sm text-gray-500">
                Cancel
              </button>
              <button onClick={saveCrop} className={`px-6 py-2 rounded-xl font-bold text-sm text-white ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}>
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
