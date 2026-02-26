import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const faqItems = [
  { questionKey: 'faq.q1', answerKey: 'faq.a1' },
  { questionKey: 'faq.q2', answerKey: 'faq.a2' },
  { questionKey: 'faq.q3', answerKey: 'faq.a3' },
  { questionKey: 'faq.q4', answerKey: 'faq.a4' },
  { questionKey: 'faq.q5', answerKey: 'faq.a5' },
];

// Fallback data if translations not yet available
const fallbackFaq = [
  { question: "Faut-il des compétences techniques pour utiliser vos solutions ?", answer: "Absolument pas ! Nos solutions sont conçues pour être simples d'utilisation. Nous nous occupons de toute la partie technique." },
  { question: "Combien de temps faut-il pour mettre en place une solution IA ?", answer: "La plupart de nos solutions sont opérationnelles en 48h. L'audit gratuit prend 24h." },
  { question: "L'audit est-il vraiment gratuit et sans engagement ?", answer: "Oui, 100% gratuit et sans engagement. Nous analysons votre activité et vous livrons un plan d'action concret." },
  { question: "Mes données sont-elles en sécurité ?", answer: "Absolument. Nous sommes conformes RGPD et toutes les données sont hébergées en Europe." },
  { question: "Quel type d'entreprise peut bénéficier de vos services ?", answer: "Toute PME peut en bénéficier ! Restaurants, e-commerces, agences marketing, cabinets de conseil, artisans..." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useTranslation('common');

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Questions fréquentes
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const question = t(item.questionKey, { defaultValue: fallbackFaq[idx]?.question });
            const answer = t(item.answerKey, { defaultValue: fallbackFaq[idx]?.answer });
            const isOpen = openIndex === idx;

            return (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-gray-900 pr-4">{question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
