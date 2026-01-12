import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StartForm from './StartForm';
import NavMenu from './layout/NavMenu';

export default function Header() {
  const [showStartForm, setShowStartForm] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed w-full bg-indigo-600 z-50 shadow-md">
      <NavMenu onAuditClick={() => setShowStartForm(true)} />
      
      <StartForm 
        isOpen={showStartForm} 
        onClose={() => setShowStartForm(false)} 
      />
    </header>
  );
}