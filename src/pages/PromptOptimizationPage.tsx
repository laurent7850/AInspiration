import React from 'react';
import PromptOptimization from '../components/PromptOptimization';
import SEOHead from '../components/SEOHead';

export default function PromptOptimizationPage() {
  return (
    <>
      <SEOHead canonical="/prompts" />
      <PromptOptimization />
    </>
  );
}