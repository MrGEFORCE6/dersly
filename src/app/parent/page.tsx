'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedParentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 text-sm">
      <span>Öğrenci portalına yönlendiriliyorsunuz...</span>
    </div>
  );
}
