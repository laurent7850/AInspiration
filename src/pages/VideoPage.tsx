import React from 'react';
import { Video, Film, Captions, Sparkles, Megaphone, Package, GraduationCap } from 'lucide-react';
import MediaService from '../components/MediaService';

const HERO = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d';
const USE_CASE_IMAGES = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728',
  'https://images.unsplash.com/photo-1606857521015-7f9fcf423740',
  'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85',
];

export default function VideoPage() {
  return (
    <MediaService
      ns="video"
      canonical="/video"
      heroImage={HERO}
      useCaseImages={USE_CASE_IMAGES}
      badgeIcon={Video}
      featureIcons={[Video, Film, Captions, Sparkles]}
      useCaseIcons={[Megaphone, Package, GraduationCap]}
      schemaName="Production Vidéo par IA pour PME"
      schemaDescription="Production vidéo assistée par IA : vidéos marketing, avatars IA, montage automatique, sous-titres multilingues et génération de contenu vidéo pour les PME."
    />
  );
}
