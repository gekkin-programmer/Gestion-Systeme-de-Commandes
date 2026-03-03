'use client';

import { useRouter } from 'next/navigation';
import dk from '@/styles/dark.module.css';

export function BackButton() {
  const router = useRouter();
  return (
    <button className={dk.backBtn} onClick={() => router.back()} aria-label="Retour">
      ← Retour
    </button>
  );
}
