import { Shield, Clock, Users, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const proofItems = [
  { icon: Clock, labelKey: 'stats.acceleration' },
  { icon: Shield, labelKey: 'stats.accuracy' },
  { icon: Users, labelKey: 'stats.clients' },
  { icon: Award, labelKey: 'stats.uptime' },
];

export default function SocialProof() {
  const { t } = useTranslation('common');

  return (
    <section className="bg-gray-50 border-y border-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {proofItems.map(({ icon: Icon, labelKey }) => (
            <div key={labelKey} className="flex items-center gap-2 text-gray-600">
              <Icon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium">{t(labelKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
