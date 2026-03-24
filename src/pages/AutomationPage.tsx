import React from 'react';
import Automation from '../components/Automation';
import SEOHead from '../components/SEOHead';

export default function AutomationPage() {
  return (
    <>
      <SEOHead canonical="/automatisation" />
      <Automation />
    </>
  );
}