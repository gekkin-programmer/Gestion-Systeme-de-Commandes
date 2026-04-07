'use client';

import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  hotelName?: string;
}

export function Navbar({ hotelName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <p className="text-sm font-bold text-gray-900">{hotelName ?? 'Hôtel'}</p>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
