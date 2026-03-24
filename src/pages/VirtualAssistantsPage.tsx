import React from 'react';
import VirtualAssistants from '../components/VirtualAssistants';
import SEOHead from '../components/SEOHead';

export default function VirtualAssistantsPage() {
  return (
    <>
      <SEOHead canonical="/assistants" />
      <VirtualAssistants />
    </>
  );
}