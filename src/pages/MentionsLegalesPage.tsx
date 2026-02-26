import SEOHead from '../components/SEOHead';

export default function MentionsLegalesPage() {
  return (
    <>
      <SEOHead
        title="Mentions Légales | AInspiration"
        description="Mentions légales du site ainspiration.eu - Distr'Action SPRL, éditeur et hébergeur."
        noindex
      />
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">1. Éditeur du site</h2>
            <p className="text-gray-600">
              Le site <strong>ainspiration.eu</strong> est édité par :<br />
              <strong>Distr'Action SPRL</strong><br />
              Grand Place 50, 7850 Enghien, Belgique<br />
              N° TVA : BE 0795.938.932<br />
              Email : <a href="mailto:info@ainspiration.eu" className="text-indigo-600 hover:underline">info@ainspiration.eu</a><br />
              Téléphone : +32 477 94 28 65
            </p>

            <h2 className="text-xl font-semibold text-gray-900">2. Responsable de la publication</h2>
            <p className="text-gray-600">
              Le responsable de la publication est le gérant de Distr'Action SPRL.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">3. Hébergement</h2>
            <p className="text-gray-600">
              Le site est hébergé par :<br />
              <strong>Hostinger International Ltd</strong><br />
              61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
              Site web : hostinger.com
            </p>

            <h2 className="text-xl font-semibold text-gray-900">4. Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L'ensemble des contenus du site (textes, images, logos, vidéos, structure) sont protégés par le droit d'auteur
              et le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans
              autorisation préalable écrite de Distr'Action SPRL.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">5. Données personnelles</h2>
            <p className="text-gray-600">
              Les données personnelles collectées sur ce site sont traitées conformément au Règlement Général sur la
              Protection des Données (RGPD). Pour plus d'informations, consultez notre{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">Politique de Confidentialité</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">6. Cookies</h2>
            <p className="text-gray-600">
              Ce site utilise des cookies essentiels au fonctionnement et, avec votre consentement, des cookies
              d'analyse pour améliorer votre expérience. Vous pouvez gérer vos préférences via la bannière de cookies.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">7. Litiges</h2>
            <p className="text-gray-600">
              En cas de litige, le droit belge est applicable. Les tribunaux compétents sont ceux de l'arrondissement
              judiciaire du siège social de Distr'Action SPRL.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
