import { useState } from 'react';
import StartForm from './StartForm';
import NavMenu from './layout/NavMenu';

export default function Header() {
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <header className="fixed w-full bg-gradient-to-b from-slate-800/95 to-slate-800/0 z-50 backdrop-blur-sm">
      <NavMenu onAuditClick={() => setShowStartForm(true)} />
      
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </header>
  );
}