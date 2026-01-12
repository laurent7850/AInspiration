import React from 'react';
import { Shield, Lock, FileCheck, Users } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique de Confidentialité
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              Protection de vos données
            </h2>
            <p className="text-gray-600 mb-4">
              Nous accordons la plus haute importance à la protection de vos données personnelles. 
              Cette politique détaille comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Données collectées
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Informations de contact (nom, email, téléphone)</li>
              <li>Données d'utilisation du service</li>
              <li>Cookies et identifiants techniques</li>
              <li>Préférences de communication</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-600" />
              Utilisation des cookies
            </h2>
            <p className="text-gray-600 mb-4">
              Nous utilisons différents types de cookies :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site
              </li>
              <li>
                <strong>Cookies analytiques :</strong> Pour comprendre l'utilisation du site
              </li>
              <li>
                <strong>Cookies marketing :</strong> Pour personnaliser votre expérience
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              Vos droits
            </h2>
            <p className="text-gray-600 mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
            <p className="text-gray-600">
              Pour toute question concernant vos données personnelles, contactez notre DPO :
              <br />
              Email : info@aimagination.eu
              <br />
              Adresse : Rue de la Loi 227, 1040 Bruxelles, Belgique
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}