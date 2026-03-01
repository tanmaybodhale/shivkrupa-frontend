'use client';

import dynamic from 'next/dynamic';

interface LocationPickerProps {
  location: { lat: number; lng: number } | null;
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
}

const LocationPickerInner = dynamic(
  () => import('./LocationPickerInner'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">
        Loading map...
      </div>
    )
  }
);

export default function LocationPicker(props: LocationPickerProps) {
  return <LocationPickerInner {...props} />;
}
