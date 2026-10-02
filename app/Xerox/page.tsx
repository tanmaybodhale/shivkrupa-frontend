import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import XeroxUploader from '@/components/customer/XeroxUploader';

export const metadata = {
  title: 'Xerox / Printing Service',
  description: 'Upload photos or documents for printing — set copies, orientation, page size, and crop per file.',
};

export default function XeroxPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0b24]">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/customer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-5"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 dark:from-indigo-600 dark:to-purple-600 flex items-center justify-center shrink-0">
            <Printer size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              Xerox / Printing Service
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload, customize, and order prints — delivered or ready for pickup.
            </p>
          </div>
        </div>

        {/* Uploader */}
        <XeroxUploader />
      </div>
    </div>
  );
}
