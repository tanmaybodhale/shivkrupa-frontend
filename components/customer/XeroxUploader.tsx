'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Upload, X, FileText, Crop as CropIcon, Plus, Minus, Lock, Check } from 'lucide-react';
import { getXeroxOptions, pricePerPage, lineTotal, countPages, Pricing } from '@/lib/xeroxPricing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Orientation = 'portrait' | 'landscape';
type ColorMode = 'bw' | 'color';

// Internal value -> label used in the admin pricing keys ("A4 - B&W")
const MODE_LABEL: Record<ColorMode, string> = { bw: 'B&W', color: 'Color' };
const MODE_DISPLAY: Record<ColorMode, string> = { bw: 'B & W', color: 'Coloured' };
const LABEL_TO_MODE: Record<string, ColorMode> = { 'B&W': 'bw', Color: 'color' };

// Paper dimensions in inches, shown under the orientation buttons
const SIZE_DIMS: Record<string, [number, number]> = {
  A5: [5.8, 8.3],
  A4: [8.3, 11.7],
  A3: [11.7, 16.5],
  A2: [16.5, 23.4],
};

interface LocalFile {
  id: string;
  file: File;
  previewUrl: string;
  isImage: boolean;
  isPdf: boolean;
  copies: number;
  orientation: Orientation;
  pageSize: string;
  colorMode: ColorMode;
  croppedAreaPixels: Area | null;
  pages: number; // pages in ONE copy of this file
  pagesKnown: boolean; // false = couldn't count, customer must enter it
  countFailed: boolean; // couldn't count -> customer must upload as PDF
  countingPages: boolean;
}

export default function XeroxUploader() {
  const { showToast, addPrintItemsToCart } = useApp();
  const { isDark } = useTheme();
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<LocalFile | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<LocalFile[]>([]);
  filesRef.current = files;

  // Pricing comes from Admin > Services > Xerox
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pricingLoaded, setPricingLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        const data = await res.json();
        const xerox = (data.services || []).find((s: any) => s.key === 'xerox' && s.active !== false);
        setPricing(xerox && xerox.pricing && typeof xerox.pricing === 'object' ? xerox.pricing : null);
      } catch (e) {
        console.error('Failed to load Xerox pricing:', e);
        setPricing(null);
      } finally {
        setPricingLoaded(true);
      }
    })();
  }, []);

  // Free object URLs when the component unmounts
  useEffect(() => {
    return () => {
      filesRef.current.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, []);

  const options = useMemo(() => getXeroxOptions(pricing), [pricing]);
  const serviceReady = options.sizes.length > 0;

  const typesFor = (size: string): ColorMode[] =>
    (options.typesBySize[size] || [])
      .map(label => LABEL_TO_MODE[label])
      .filter(Boolean) as ColorMode[];

  const selected = files.find(f => f.id === selectedId) || null;
  const selectedIndex = selected ? files.findIndex(f => f.id === selected.id) : -1;

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    if (!serviceReady) {
      showToast('❌ Printing service is not set up yet. Please contact the store.');
      return;
    }
    // Only photos and PDFs are supported (Word / Excel etc. are rejected)
    const allowed = Array.from(fileList).filter(
      f => f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    if (allowed.length < fileList.length) {
      showToast('❌ Only JPG, PNG and PDF files are supported.Convert them to PDF first.');
    }
    if (allowed.length === 0) return;
    const defaultSize = options.sizes[0];
    const defaultMode = typesFor(defaultSize)[0] || 'bw';

    const newFiles: LocalFile[] = allowed.map(file => {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      return {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: isImage || isPdf ? URL.createObjectURL(file) : '',
        isImage,
        isPdf,
        copies: 1,
        orientation: 'portrait',
        pageSize: defaultSize,
        colorMode: defaultMode,
        croppedAreaPixels: null,
        pages: 1,
        pagesKnown: isImage,
        countFailed: false,
        countingPages: !isImage,
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
    if (newFiles.length > 0) setSelectedId(newFiles[0].id);

    // Count pages for PDFs. If a PDF can't be counted, it is flagged (no manual entry).
    newFiles.forEach(async nf => {
      if (nf.isImage) return;
      const n = await countPages(nf.file);
      setFiles(prev =>
        prev.map(f =>
          f.id === nf.id
            ? n !== null
              ? { ...f, pages: n, pagesKnown: true, countingPages: false, countFailed: false }
              : { ...f, countingPages: false, countFailed: true }
            : f
        )
      );
    });
  };

  const updateFile = (id: string, patch: Partial<LocalFile>) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  const changePageSize = (f: LocalFile, size: string) => {
    const modes = typesFor(size);
    const colorMode = modes.includes(f.colorMode) ? f.colorMode : modes[0] || 'bw';
    updateFile(f.id, { pageSize: size, colorMode });
  };

  const removeFile = (id: string) => {
    const idx = files.findIndex(f => f.id === id);
    const target = files[idx];
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (selectedId === id) {
      setSelectedId(remaining.length ? remaining[Math.min(idx, remaining.length - 1)].id : null);
    }
  };

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      if (cropTarget) {
        setCropTarget(prev => (prev ? { ...prev, croppedAreaPixels } : prev));
      }
    },
    [cropTarget]
  );

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

    return new Promise<File>(resolve => {
      canvas.toBlob(
        blob => {
          if (!blob) {
            resolve(localFile.file);
            return;
          }
          resolve(new File([blob], localFile.file.name, { type: localFile.file.type }));
        },
        localFile.file.type,
        0.95
      );
    });
  };

  const fileTotal = (f: LocalFile) =>
    lineTotal(pricing, { size: f.pageSize, type: MODE_LABEL[f.colorMode], pages: f.pages, copies: f.copies });

  const grandTotal = files.reduce((s, f) => s + fileTotal(f), 0);

  const handleAddAllToCart = async () => {
    if (files.length === 0) {
      showToast('❌ Please upload at least one file');
      return;
    }
    if (!serviceReady) {
      showToast('❌ Printing service is not set up yet. Please contact the store.');
      return;
    }
    if (files.some(f => f.countingPages)) {
      showToast('⏳ Still counting pages, one moment…');
      return;
    }
    const failed = files.find(f => f.countFailed);
    if (failed) {
      setSelectedId(failed.id);
      showToast(`❌ ${failed.file.name}: couldn't read the page count. Please upload a different PDF.`);
      return;
    }
    const bad = files.find(f => pricePerPage(pricing, f.pageSize, MODE_LABEL[f.colorMode]) <= 0 || f.pages < 1);
    if (bad) {
      setSelectedId(bad.id);
      showToast(`❌ ${bad.file.name}: choose an available size/type and a valid page count`);
      return;
    }

    setUploading(true);
    try {
      let baseProduct: any = null;
      try {
        const catalogRes = await fetch(`${API_URL}/catalog`);
        const catalogData = await catalogRes.json();
        baseProduct =
          catalogData.products?.find((p: any) => (p.category || '').trim().toLowerCase() === 'xerox') || null;
      } catch {
        /* ignore, fall back to a minimal base item */
      }

      const base = baseProduct ?? {
        _id: 'xerox-service',
        name: 'Xerox / Printing',
        category: 'xerox',
        price: 0,
        mrp: 0,
        unit: 'copy',
        image: '',
        inStock: true,
      };

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

      // One cart line per uploaded file.
      //   price = cost of ONE copy of the whole file (price per page x pages)
      //   qty   = number of copies
      const newCartItems = uploadData.files.map((uploaded: any, idx: number) => {
        const local = files[idx];
        const perPage = pricePerPage(pricing, local.pageSize, MODE_LABEL[local.colorMode]);
        return {
          ...base,
          _id: `${base._id}-print-${uploaded.public_id}`,
          name: `Print: ${local.file.name}`,
          price: perPage * local.pages,
          mrp: perPage * local.pages,
          unit: 'copy',
          inStock: true,
          image: local.isImage ? uploaded.url : '',
          emoji: local.isImage ? undefined : '📄',
          qty: local.copies,
          printFile: {
            fileUrl: uploaded.url,
            fileName: uploaded.originalName,
            fileType: uploaded.mimeType,
            resourceType: uploaded.resourceType,
            orientation: local.orientation,
            pageSize: local.pageSize,
            colorMode: local.colorMode,
            pages: local.pages,
            pricePerPage: perPage,
          },
        };
      });

      addPrintItemsToCart(newCartItems);
      files.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
      setSelectedId(null);
      showToast(`✅ ${newCartItems.length} file(s) added to cart!`);
    } catch (error) {
      console.error('Print upload error:', error);
      showToast('❌ Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /* ---------- styling helpers ---------- */
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const strong = isDark ? 'text-gray-100' : 'text-gray-900';
  const divider = isDark ? 'border-[#2d2450]' : 'border-gray-100';

  // Brand accent: orange (light) / indigo (dark)
  const ac = isDark
    ? {
        border: 'border-indigo-400',
        hoverBorder: 'hover:border-indigo-400/50',
        hoverTint: 'hover:bg-indigo-500/10',
        solid: 'bg-indigo-500',
        text: 'text-indigo-400',
        ring: 'focus-visible:ring-indigo-400',
        shadow: 'shadow-indigo-500/20',
        focusBorder: 'focus:border-indigo-400',
        activeBtn: 'border-indigo-400 bg-indigo-500/15 text-indigo-200 shadow-md shadow-indigo-500/10',
        orient: 'border-indigo-400 bg-indigo-500/40',
        addTile: 'border-[#2d2450] text-indigo-400 hover:bg-indigo-500/10',
      }
    : {
        border: 'border-orange-500',
        hoverBorder: 'hover:border-orange-300',
        hoverTint: 'hover:bg-orange-50/60',
        solid: 'bg-orange-500',
        text: 'text-orange-600',
        ring: 'focus-visible:ring-orange-400',
        shadow: 'shadow-orange-500/20',
        focusBorder: 'focus:border-orange-500',
        activeBtn: 'border-orange-500 bg-orange-50 text-orange-900 shadow-md shadow-orange-500/10',
        orient: 'border-orange-500 bg-orange-200',
        addTile: 'border-gray-200 text-orange-600 hover:border-orange-400 hover:bg-orange-50/50',
      };

  // Choice buttons (size / colour / orientation)
  const choiceCls = (active: boolean) =>
    `relative flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all active:scale-[0.97] focus:outline-none focus-visible:ring-2 ${ac.ring} ${
      active
        ? isDark
          ? ac.activeBtn
          : ac.activeBtn
        : isDark
        ? `border-[#2d2450] bg-[#13102a] text-gray-300 ${ac.hoverBorder}`
        : `border-gray-200 bg-white text-gray-700 ${ac.hoverBorder} ${ac.hoverTint}`
    }`;

  const CheckDot = ({ active }: { active: boolean }) =>
    active ? (
      <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full ${ac.solid} text-white shadow`}>
        <Check size={10} strokeWidth={4} />
      </span>
    ) : null;

  const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
    <div className={`py-4 border-t ${divider}`}>
      <div className="mb-3">
        <p className={`text-sm font-black ${strong}`}>{title}</p>
        {hint && <p className={`text-[11px] ${muted}`}>{hint}</p>}
      </div>
      {children}
    </div>
  );

  const pageLabel = (n: number) => `${n} ${n === 1 ? 'page' : 'pages'}`;

  /* ---------- thumbnail ---------- */
  const renderPreview = (f: LocalFile) => {
    if (f.isImage) {
      return <img src={f.previewUrl} alt={f.file.name} className="h-full w-full object-contain bg-white" />;
    }
    const ext = (f.file.name.split('.').pop() || 'file').toUpperCase();
    return (
      <div className="relative h-full w-full overflow-hidden bg-white">
        {/* Icon fallback (always visible on phones, sits behind the PDF on larger screens) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <FileText size={34} className={isDark ? 'text-indigo-400' : 'text-orange-400'} />
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-black text-gray-500">{ext}</span>
        </div>
        {f.isPdf && f.previewUrl && (
          <iframe
            src={`${f.previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={f.file.name}
            className="pointer-events-none absolute inset-0 hidden h-full w-full bg-white sm:block"
          />
        )}
      </div>
    );
  };

  const selected_dims = selected ? SIZE_DIMS[selected.pageSize.toUpperCase()] : undefined;
  const fmtDims = (portrait: boolean) =>
    selected_dims
      ? portrait
        ? `${selected_dims[0]} x ${selected_dims[1]} in`
        : `${selected_dims[1]} x ${selected_dims[0]} in`
      : null;

  return (
    <div className={`rounded-3xl border p-4 sm:p-6 ${isDark ? 'bg-[#1a1535] border-[#2d2450]' : 'bg-white border-orange-100'}`}>
      <h3 className={`text-xl font-black mb-1 ${strong}`}>🖨️ Xerox / Printing Service</h3>
      <p className={`text-sm mb-5 ${muted}`}>
        Upload photos or documents, then tap a file to set copies, size, colour and orientation.
      </p>

      {pricingLoaded && !serviceReady && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
            isDark ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          Printing service is not set up yet. Please contact the store.
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={e => {
          handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Empty state: big dropzone */}
      {files.length === 0 && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={!pricingLoaded || !serviceReady}
          className={`w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 ${
            isDark
              ? 'border-[#2d2450] text-gray-400 hover:border-indigo-500/50 hover:bg-indigo-500/5'
              : 'border-orange-200 text-gray-500 hover:border-orange-400 hover:bg-orange-50/50'
          }`}
        >
          <Upload size={28} />
          <span className="font-bold text-sm">Tap to upload images or documents</span>
          <span className="text-xs opacity-70">JPG, PNG, PDF — up to 15MB each</span>
        </button>
      )}

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((f, i) => {
              const active = f.id === selectedId;
              return (
                <div key={f.id} className="min-w-0">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(f.id)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedId(f.id)}
                    aria-pressed={active}
                    className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 ${ac.ring} ${
                      active
                        ? `${ac.border} shadow-lg ${ac.shadow}`
                        : isDark
                        ? `border-[#2d2450] ${ac.hoverBorder}`
                        : `border-gray-200 ${ac.hoverBorder}`
                    }`}
                  >
                    {renderPreview(f)}
                    {f.isImage && f.croppedAreaPixels && (
                      <span className={`absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full ${ac.solid} px-2 py-0.5 text-[10px] font-bold text-white`}>
                        <CropIcon size={10} /> Cropped
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeFile(f.id);
                      }}
                      aria-label={`Remove ${f.file.name}`}
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-md hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className={`mt-1.5 truncate text-center text-xs font-semibold ${active ? ac.text : muted}`} title={f.file.name}>
                    File {i + 1} ({f.countingPages ? 'counting…' : f.countFailed ? 'unreadable' : pageLabel(f.pages)})
                  </p>
                </div>
              );
            })}

            {/* Add files tile */}
            <div className="min-w-0">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={!serviceReady}
                className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed transition-all disabled:opacity-50 ${
                  ac.addTile
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${ac.solid} text-white shadow-md`}>
                  <Plus size={20} />
                </span>
                <span className="text-xs font-bold">Add files</span>
              </button>
            </div>
          </div>

          {/* Settings for the selected file */}
          {selected && (
            <div
              className={`mt-6 rounded-2xl border px-4 sm:px-6 pt-4 ${
                isDark ? 'bg-[#13102a] border-[#2d2450]' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-4">
                <div className="min-w-0">
                  <p className={`text-sm font-black ${strong}`}>
                    File {selectedIndex + 1} ({selected.countingPages ? 'counting pages…' : selected.countFailed ? 'pages unknown' : pageLabel(selected.pages)})
                  </p>
                  <p className={`truncate text-[11px] ${muted}`}>{selected.file.name}</p>
                </div>
                {selected.isImage && (
                  <button
                    onClick={() => {
                      setCropTarget(selected);
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                      selected.croppedAreaPixels
                        ? `${ac.border} ${ac.solid} text-white`
                        : isDark
                        ? `border-[#2d2450] text-gray-300 ${ac.hoverBorder}`
                        : `border-gray-200 text-gray-700 ${ac.hoverBorder}`
                    }`}
                  >
                    <CropIcon size={14} /> {selected.croppedAreaPixels ? 'Cropped' : 'Crop'}
                  </button>
                )}
              </div>

              {/* Shown only when a PDF's page count could not be read */}
              {selected.countFailed && (
                <div
                  className={`mb-4 rounded-xl border px-4 py-3 text-xs font-semibold ${
                    isDark ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  We couldn&apos;t read the page count of this PDF (it may be protected or damaged). Please remove it and upload another copy.
                </div>
              )}

              {/* Copies */}
              <div className={`flex items-center justify-between gap-3 border-t py-4 ${divider}`}>
                <div>
                  <p className={`text-sm font-black ${strong}`}>Number of copies</p>
                  <p className={`text-[11px] ${muted}`}>
                    File {selectedIndex + 1} ({pageLabel(selected.pages)})
                  </p>
                </div>
                <div className={`flex items-center overflow-hidden rounded-xl border-2 ${ac.border}`}>
                  <button
                    onClick={() => updateFile(selected.id, { copies: Math.max(1, selected.copies - 1) })}
                    disabled={selected.copies <= 1}
                    aria-label="Fewer copies"
                    className={`flex h-10 w-10 items-center justify-center ${ac.text} ${ac.hoverTint} disabled:opacity-30`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`w-10 text-center text-base font-black ${strong}`}>{selected.copies}</span>
                  <button
                    onClick={() => updateFile(selected.id, { copies: selected.copies + 1 })}
                    aria-label="More copies"
                    className={`flex h-10 w-10 items-center justify-center ${ac.text} ${ac.hoverTint}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Page size */}
              <Section title="Choose page size">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {options.sizes.map(size => {
                    const active = selected.pageSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => changePageSize(selected, size)}
                        className={`${choiceCls(active)} justify-center`}
                      >
                        <CheckDot active={active} />
                        <span className="text-sm font-black">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Colour + orientation */}
              <div className={`grid gap-x-8 sm:grid-cols-2 border-t ${divider}`}>
                <div className="py-4">
                  <p className={`mb-3 text-sm font-black ${strong}`}>Choose print colour</p>
                  <div className="grid grid-cols-2 gap-2">
                    {typesFor(selected.pageSize).map(m => {
                      const active = selected.colorMode === m;
                      const price = pricePerPage(pricing, selected.pageSize, MODE_LABEL[m]);
                      return (
                        <button
                          key={m}
                          onClick={() => updateFile(selected.id, { colorMode: m })}
                          className={choiceCls(active)}
                        >
                          <CheckDot active={active} />
                          <span className="flex shrink-0 items-center">
                            {m === 'color' ? (
                              <span className="relative block h-6 w-6">
                                <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-red-500" />
                                <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-blue-500 mix-blend-multiply" />
                                <span className="absolute bottom-0 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-yellow-400 mix-blend-multiply" />
                              </span>
                            ) : (
                              <span className="relative block h-6 w-6">
                                <span className="absolute left-0 top-1 h-4 w-4 rounded-full bg-gray-800" />
                                <span className="absolute right-0 top-1 h-4 w-4 rounded-full bg-gray-400 mix-blend-multiply" />
                              </span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black leading-tight">{MODE_DISPLAY[m]}</span>
                            <span className={`block text-[11px] font-semibold ${active ? '' : muted}`}>₹{price}/page</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={`py-4 border-t sm:border-t-0 ${divider}`}>
                  <p className={`mb-3 text-sm font-black ${strong}`}>Choose print orientation</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['portrait', 'landscape'] as Orientation[]).map(o => {
                      const active = selected.orientation === o;
                      const dims = fmtDims(o === 'portrait');
                      return (
                        <button
                          key={o}
                          onClick={() => updateFile(selected.id, { orientation: o })}
                          className={choiceCls(active)}
                        >
                          <CheckDot active={active} />
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                            <span
                              className={`block rounded-[3px] border-2 ${
                                o === 'portrait' ? 'h-6 w-4' : 'h-4 w-6'
                              } ${active ? ac.orient : 'border-gray-400 bg-gray-100'}`}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-black capitalize leading-tight">{o}</span>
                            {dims && (
                              <span className={`block truncate text-[11px] font-semibold ${active ? '' : muted}`}>{dims}</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price breakdown for this file */}
              <div className={`border-t py-3 text-center text-[12px] font-bold ${divider} ${muted}`}>
                {pageLabel(selected.pages)} × ₹{pricePerPage(pricing, selected.pageSize, MODE_LABEL[selected.colorMode])} ×{' '}
                {selected.copies} {selected.copies === 1 ? 'copy' : 'copies'} ={' '}
                <span className={strong}>₹{fileTotal(selected)}</span>
              </div>
            </div>
          )}

          {/* Summary / add to cart (same as before) */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <span className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Total copies: {files.reduce((c, f) => c + f.copies, 0)}
              </span>
              <span className={`block text-sm font-black ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Total: ₹{grandTotal}
              </span>
            </div>
            <button
              onClick={handleAddAllToCart}
              disabled={uploading || files.some(f => f.countingPages)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all disabled:opacity-60 ${
                isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-yellow-500'
              }`}
            >
              {uploading ? 'Uploading…' : `Add to Cart (${files.length})`}
            </button>
          </div>
        </>
      )}

      {/* Crop modal */}
      {cropTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4">
          <div className={`w-full max-w-lg rounded-3xl overflow-hidden ${isDark ? 'bg-[#1a1535]' : 'bg-white'}`}>
            <div className="relative h-80 sm:h-96">
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
              <button
                onClick={saveCrop}
                className={`px-6 py-2 rounded-xl font-bold text-sm text-white ${isDark ? 'bg-indigo-600' : 'bg-orange-500'}`}
              >
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
