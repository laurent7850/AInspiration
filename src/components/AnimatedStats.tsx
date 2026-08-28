import React from 'react';
import { TrendingUp, ThumbsUp, Zap, Clock } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { useTranslation } from 'react-i18next';

interface StatItemProps {
  end: number;
  suffix: string;
  prefix?: string;
  label: string;
  icon: React.ReactNode;
  delay?: number;
  color: string;
  isDark?: boolean;
}

function StatItem({ end, suffix, prefix = '', label, icon, delay = 0, color, isDark = false }: StatItemProps) {
  const { ref, formattedValue, hasAnimated } = useCountUp({
    end,
    suffix,
    prefix,
    duration: 2200,
    delay,
  });

  return (
    <div
      ref={ref}
      className={`text-center transition-transform duration-700 ease-out ${hasAnimated ? 'translate-y-0' : 'translate-y-2'}`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} mb-3`}>
        {icon}
      </div>
      <div className={`text-3xl sm:text-4xl font-bold mb-1 tabular-nums ${isDark ? 'text-white' : 'text-ink'}`}>
        {formattedValue}
      </div>
      <div className={`text-sm font-medium ${isDark ? 'text-indigo-100' : 'text-secondary'}`}>{label}</div>
    </div>
  );
}

interface AnimatedStatsProps {
  /** 'light' for white bg (Hero), 'dark' for indigo bg (SolutionsPage) */
  variant?: 'light' | 'dark';
  className?: string;
}

export default function AnimatedStats({ variant = 'light', className = '' }: AnimatedStatsProps) {
  const { t } = useTranslation('common');

  const isDark = variant === 'dark';

  const stats: StatItemProps[] = [
    {
      end: 50,
      prefix: '+',
      suffix: '',
      label: t('animatedStats.roi', 'PME accompagnées'),
      icon: <TrendingUp className={`w-6 h-6 ${isDark ? 'text-indigo-100' : 'text-indigo-600'}`} />,
      delay: 0,
      color: isDark ? 'bg-white/10' : 'bg-indigo-50',
      isDark,
    },
    {
      end: 98,
      suffix: '%',
      label: t('animatedStats.satisfaction', 'Satisfaction client'),
      icon: <ThumbsUp className={`w-6 h-6 ${isDark ? 'text-indigo-100' : 'text-indigo-600'}`} />,
      delay: 150,
      color: isDark ? 'bg-white/10' : 'bg-indigo-50',
      isDark,
    },
    {
      end: 45,
      prefix: '+',
      suffix: '%',
      label: t('animatedStats.productivity', 'Productivité'),
      icon: <Zap className={`w-6 h-6 ${isDark ? 'text-indigo-100' : 'text-indigo-600'}`} />,
      delay: 300,
      color: isDark ? 'bg-white/10' : 'bg-indigo-50',
      isDark,
    },
    {
      end: 60,
      prefix: '-',
      suffix: '%',
      label: t('animatedStats.processing', 'Temps de traitement'),
      icon: <Clock className={`w-6 h-6 ${isDark ? 'text-indigo-100' : 'text-indigo-600'}`} />,
      delay: 450,
      color: isDark ? 'bg-white/10' : 'bg-indigo-50',
      isDark,
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 ${className}`}>
      {stats.map((stat) => (
        <StatItem key={stat.label} {...stat} />
      ))}
    </div>
  );
}
