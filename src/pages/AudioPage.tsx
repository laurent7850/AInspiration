import React from 'react';
import { Mic, Music, Languages, Headphones, Radio, Megaphone, GraduationCap } from 'lucide-react';
import MediaService from '../components/MediaService';

const HERO = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04';
const USE_CASE_IMAGES = [
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618',
];

export default function AudioPage() {
  return (
    <MediaService
      ns="audio"
      canonical="/audio"
      heroImage={HERO}
      useCaseImages={USE_CASE_IMAGES}
      badgeIcon={Mic}
      featureIcons={[Mic, Music, Languages, Headphones]}
      useCaseIcons={[Radio, Megaphone, GraduationCap]}
      schemaName="Production Audio par IA pour PME"
      schemaDescription="Production audio assistée par IA : podcasts, voix off, doublage multilingue, transcription, nettoyage et génération sonore pour les PME."
    />
  );
}
