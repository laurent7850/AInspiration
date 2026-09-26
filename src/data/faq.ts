/**
 * FAQ de l accueil — source unique du libelle francais.
 *
 * Ce texte etait duplique dans HomePage.tsx (donne au schema JSON-LD lu par
 * les moteurs) et dans FAQ.tsx (repli i18n). Les deux copies ont derive : les
 * locales avaient retire l offre d audit gratuit, abandonnee le 16/09/2026,
 * tandis que les deux copies en dur promettaient encore « 100% gratuit ». Un
 * lecteur voyait une chose, Google en recevait une autre.
 *
 * A tenir en phase avec les cles `faq.*` de public/locales/fr/common.json —
 * ce fichier en est genere.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const faqFallback: FaqEntry[] = [
  {
    question: "Faut-il des compétences techniques pour utiliser vos solutions ?",
    answer: "Absolument pas ! Nos solutions sont conçues pour être simples d'utilisation. Nous nous occupons de toute la partie technique.",
  },
  {
    question: "Combien de temps faut-il pour mettre en place une solution IA ?",
    answer: "La plupart des solutions sont opérationnelles en quelques jours ouvrés après validation du périmètre. Le rendez-vous de découverte, lui, dure trente minutes.",
  },
  {
    question: "Le rendez-vous de découverte engage-t-il à quelque chose ?",
    answer: "Non. Trente minutes pour comprendre votre situation. S'il n'y a rien à faire chez vous, je vous le dis — c'est aussi ce qui rend l'avis utile.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer: "Absolument. Nous sommes conformes RGPD et toutes les données sont hébergées en Europe.",
  },
  {
    question: "Quel type d'entreprise peut bénéficier de vos services ?",
    answer: "Toute PME peut en bénéficier ! Restaurants, e-commerces, agences marketing, cabinets de conseil, artisans...",
  },
];
