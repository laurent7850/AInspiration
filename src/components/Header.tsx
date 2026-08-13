import { useState, lazy, Suspense } from 'react';
const AuditForm = lazy(() => import('./AuditForm'));
import NavMenu from './layout/NavMenu';

export default function Header() {
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <header className="fixed w-full bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 z-50">
      <NavMenu onAuditClick={() => setShowStartForm(true)} />
      
      {showStartForm && (
        <Suspense fallback={null}>
          <AuditForm
            isOpen={showStartForm}
            onClose={() => setShowStartForm(false)}
          />
        </Suspense>
      )}
    </header>
  );
}