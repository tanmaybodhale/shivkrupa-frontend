'use client';

import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[999] px-6 py-3.5 rounded-full text-[13px] sm:text-sm font-bold text-white bg-gray-900 shadow-2xl shadow-orange-900/20 border border-gray-800 pointer-events-none flex items-center justify-center gap-2 max-w-[90vw] w-max text-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        toast.visible 
          ? 'bottom-8 translate-y-0 opacity-100' 
          : 'bottom-8 translate-y-12 opacity-0'
      }`}
      dangerouslySetInnerHTML={{ __html: toast.msg }}
    />
  );
}