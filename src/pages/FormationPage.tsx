import React from 'react';
import Formation from '../components/Formation';
import SEOHead from '../components/SEOHead';

export default function FormationPage() {
  return (
    <>
      <SEOHead canonical="/formation" />
      <Formation />
    </>
  );
}