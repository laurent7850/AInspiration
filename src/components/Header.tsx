import { useState } from 'react';
import StartForm from './StartForm';
import NavMenu from './layout/NavMenu';

export default function Header() {
  const [showStartForm, setShowStartForm] = useState(false);

  return (
    <header className="fixed w-full bg-[#ebecee] z-50 shadow-md">
      <NavMenu onAuditClick={() => setShowStartForm(true)} />
      
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </header>
  );
}