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
    <section id="faq" className="py-16 lg:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Questions fréquentes
          </h2>
        </div>
        <div className="divide-y divide-zinc-200">
          {faqItems.map((item, idx) => {
            const question = t(item.questionKey, { defaultValue: fallbackFaq[idx]?.question });
            const answer = t(item.answerKey, { defaultValue: fallbackFaq[idx]?.answer });
            const isOpen = openIndex === idx;

            return (
              <div key={idx}>
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-medium text-ink pr-4 group-hover:text-zinc-600 transition-colors">{question}</span>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-6' : 'max-h-0'}`}
                >
                  <p className="text-secondary text-sm leading-relaxed">
                    {answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
