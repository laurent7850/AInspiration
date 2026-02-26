import SEOHead from '../components/SEOHead';

export default function CGUPage() {
  return (
    <>
      <SEOHead
        title="Conditions Générales d'Utilisation | AInspiration"
        description="CGU - Conditions générales d'utilisation du site ainspiration.eu."
        noindex
      />
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-500 text-sm">Dernière mise à jour : 26 février 2026</p>

            <h2 className="text-xl font-semibold text-gray-900">1. Objet</h2>
            <p className="text-gray-600">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site
              web <strong>ainspiration.eu</strong>, édité par Distr'Action SPRL. En accédant au site, vous acceptez
              sans réserve les présentes CGU.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">2. Accès au site</h2>
            <p className="text-gray-600">
              Le site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Les frais
              d'accès et d'utilisation du réseau de télécommunication sont à la charge de l'utilisateur.
              Distr'Action SPRL se réserve le droit de suspendre ou interrompre l'accès au site pour maintenance
              ou mise à jour, sans préavis ni indemnité.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">3. Propriété intellectuelle</h2>
            <p className="text-gray-600">
              L'ensemble des contenus présents sur le site (textes, images, logos, vidéos, graphismes, icônes,
              logiciels) sont protégés par le droit de la propriété intellectuelle et restent la propriété exclusive
              de Distr'Action SPRL ou de ses partenaires. Toute reproduction, représentation, modification ou
              exploitation, même partielle, sans autorisation écrite préalable, est strictement interdite.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">4. Utilisation du site</h2>
            <p className="text-gray-600">
              L'utilisateur s'engage à utiliser le site conformément à sa destination et aux lois en vigueur.
              Il est notamment interdit de :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Tenter d'accéder de manière non autorisée aux systèmes du site</li>
              <li>Utiliser le site à des fins illicites ou frauduleuses</li>
              <li>Transmettre des contenus malveillants (virus, logiciels espions)</li>
              <li>Collecter des données personnelles d'autres utilisateurs</li>
              <li>Surcharger volontairement l'infrastructure du site</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900">5. Chatbot et services IA</h2>
            <p className="text-gray-600">
              Le site propose un chatbot alimenté par intelligence artificielle. Les réponses fournies par le
              chatbot sont à titre informatif et ne constituent ni un conseil juridique, ni un conseil financier,
              ni un engagement contractuel. Distr'Action SPRL ne saurait être tenue responsable des décisions
              prises sur la base des informations fournies par le chatbot.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">6. Données personnelles</h2>
            <p className="text-gray-600">
              Les données personnelles collectées via les formulaires du site sont traitées conformément au RGPD.
              Pour plus d'informations, consultez notre{' '}
              <a href="/privacy" className="text-indigo-600 hover:underline">Politique de Confidentialité</a>.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">7. Cookies</h2>
            <p className="text-gray-600">
              Le site utilise des cookies essentiels au fonctionnement et, avec votre consentement, des cookies
              d'analyse. Vous pouvez gérer vos préférences via la bannière de cookies affichée lors de votre
              première visite.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">8. Liens externes</h2>
            <p className="text-gray-600">
              Le site peut contenir des liens vers des sites tiers. Distr'Action SPRL ne contrôle pas le contenu
              de ces sites et ne saurait être tenue responsable de leur contenu ou de leurs pratiques en matière
              de protection des données.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">9. Limitation de responsabilité</h2>
            <p className="text-gray-600">
              Distr'Action SPRL s'efforce de fournir des informations exactes et à jour, mais ne garantit pas
              l'exhaustivité ou l'exactitude des contenus. L'utilisation du site se fait aux risques et périls
              de l'utilisateur. La responsabilité de Distr'Action SPRL ne saurait être engagée en cas de dommage
              indirect lié à l'utilisation du site.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">10. Modification des CGU</h2>
            <p className="text-gray-600">
              Distr'Action SPRL se réserve le droit de modifier les présentes CGU à tout moment. Les modifications
              prennent effet dès leur publication sur le site. L'utilisation continue du site après modification
              vaut acceptation des nouvelles CGU.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">11. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes CGU sont soumises au droit belge. Tout litige relatif à l'utilisation du site relève
              de la compétence des tribunaux de l'arrondissement du siège social de Distr'Action SPRL.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
