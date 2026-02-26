import SEOHead from '../components/SEOHead';

export default function CGVPage() {
  return (
    <>
      <SEOHead
        title="Conditions Générales de Vente | AInspiration"
        description="CGV - Conditions générales de vente des services AInspiration par Distr'Action SPRL."
        noindex
      />
      <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales de Vente</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-gray-500 text-sm">Dernière mise à jour : 26 février 2026</p>

            <h2 className="text-xl font-semibold text-gray-900">1. Objet</h2>
            <p className="text-gray-600">
              Les présentes Conditions Générales de Vente (CGV) régissent les prestations de services proposées par
              Distr'Action SPRL, sous la marque AInspiration, à ses clients professionnels et particuliers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">2. Services proposés</h2>
            <p className="text-gray-600">
              AInspiration propose les services suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Audit IA gratuit pour PME</li>
              <li>Conseil stratégique en intelligence artificielle</li>
              <li>Formation à l'utilisation des outils IA</li>
              <li>Accompagnement personnalisé et intégration de solutions IA</li>
              <li>Développement de chatbots et automatisations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900">3. Tarifs</h2>
            <p className="text-gray-600">
              Les tarifs sont indiqués en euros (EUR), hors TVA sauf mention contraire. Un devis détaillé est remis
              avant toute prestation payante. L'audit initial est gratuit et sans engagement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">4. Commande et acceptation</h2>
            <p className="text-gray-600">
              Toute commande implique l'acceptation des présentes CGV. La commande est confirmée par la signature
              du devis ou la validation en ligne, et le versement de l'acompte éventuel.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">5. Paiement</h2>
            <p className="text-gray-600">
              Les factures sont payables à 30 jours date de facture, sauf accord contraire. En cas de retard de
              paiement, un intérêt de retard de 10% par an et une indemnité forfaitaire de 40€ sont applicables.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">6. Droit de rétractation</h2>
            <p className="text-gray-600">
              Conformément au Code de droit économique belge, le client consommateur dispose d'un droit de
              rétractation de 14 jours calendaires à compter de la conclusion du contrat, sauf si l'exécution
              du service a commencé avec son accord exprès.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">7. Responsabilité</h2>
            <p className="text-gray-600">
              AInspiration s'engage à fournir ses services avec diligence et professionnalisme (obligation de moyens).
              La responsabilité de Distr'Action SPRL est limitée au montant des sommes versées par le client pour
              la prestation concernée.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">8. Confidentialité</h2>
            <p className="text-gray-600">
              Les parties s'engagent à maintenir confidentielles toutes les informations échangées dans le cadre
              de la prestation. Cette obligation survit à la fin du contrat.
            </p>

            <h2 className="text-xl font-semibold text-gray-900">9. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes CGV sont soumises au droit belge. Tout litige relève de la compétence des tribunaux
              de l'arrondissement du siège social de Distr'Action SPRL.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
