import React from 'react';
import Consulting from '../components/Consulting';
import SEOHead from '../components/SEOHead';

export default function ConsultingPage() {
  return (
    <>
      <SEOHead canonical="/conseil" />
      <Consulting />
    </>
  );
}