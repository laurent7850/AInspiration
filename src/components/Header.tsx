import { useState, lazy, Suspense } from 'react';
const AuditForm = lazy(() => import('./AuditForm'));
import NavMenu from './layout/NavMenu';

export default function Header() {
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <header className="fixed w-full bg-indigo-50 z-50 shadow-sm">
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