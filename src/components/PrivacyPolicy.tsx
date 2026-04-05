import React from 'react';
import { Shield, Lock, FileCheck, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation('legal');

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {t('privacy.pageTitle')}
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              {t('privacy.s1_title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.s1_body')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              {t('privacy.s2_title')}
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>{t('privacy.s2_li1')}</li>
              <li>{t('privacy.s2_li2')}</li>
              <li>{t('privacy.s2_li3')}</li>
              <li>{t('privacy.s2_li4')}</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              {t('privacy.s3_title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.s3_intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>{t('privacy.s3_li1')}</li>
              <li>{t('privacy.s3_li2')}</li>
              <li>{t('privacy.s3_li3')}</li>
            </ul>
            <p className="text-gray-600 mt-4">
              {t('privacy.s3_body')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-600" />
              {t('privacy.s4_title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.s4_intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>{t('privacy.s4_essential_label')}</strong> {t('privacy.s4_essential')}
              </li>
              <li>
                <strong>{t('privacy.s4_analytics_label')}</strong> {t('privacy.s4_analytics')}
              </li>
              <li>
                <strong>{t('privacy.s4_marketing_label')}</strong> {t('privacy.s4_marketing')}
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              {t('privacy.s5_title')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.s5_intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>{t('privacy.s5_li1')}</li>
              <li>{t('privacy.s5_li2')}</li>
              <li>{t('privacy.s5_li3')}</li>
              <li>{t('privacy.s5_li4')}</li>
              <li>{t('privacy.s5_li5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('privacy.s6_title')}</h2>
            <p className="text-gray-600">
              {t('privacy.s6_body')}
              <br />
              {t('privacy.s6_email_label')} : info@ainspiration.eu
              <br />
              {t('privacy.s6_address_label')} : {t('privacy.s6_address')}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
