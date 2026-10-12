'use strict';
/**
 * Carte « Coûts OpenRouter » du tableau de bord CRM.
 *
 * Une seule route, PRIVÉE et réservée à l'administrateur :
 *   GET /api/admin/orcosts-summary
 *
 * Pourquoi une route quand même, alors que la consigne dit « la carte se rend
 * côté serveur » : l'admin AInspiration est une application React servie en
 * statique, rien n'y est rendu sur le serveur. Ce qui est rendu côté serveur,
 * c'est tout ce qui compte — l'appel à ORcosts, le jeton, la validation Zod,
 * le cache, la troncature aux cinq premières applications. Le navigateur ne
 * reçoit qu'un objet déjà mis en forme (orcosts.js, `toCard`) et ne fait que
 * le peindre. Il n'apprend ni le jeton, ni l'URL interne, ni le message
 * d'erreur d'origine.
 *
 * Pourquoi `admin` seulement : les identifiants du compte de démonstration
 * sont PUBLICS (affichés sur /login). Une route ouverte à tout compte
 * authentifié publierait les coûts de Distr'Action à n'importe quel visiteur.
 * Le compte démo ne peut pas être admin (migration-005), donc `role === 'admin'`
 * est la bonne frontière. Anonyme → 401 (contrat test/auth-routes.test.mjs),
 * authentifié non-admin → 403.
 *
 * La route ne prend AUCUN paramètre : la période est celle d'ORcosts par
 * défaut (mois en cours). Pas de `from`/`to` relayés, donc rien à valider et
 * rien qui puisse servir à faire varier la clé de cache.
 */
module.exports = function register(ctx) {
  const { app, requireAuth } = ctx;
  const client = ctx.orcostsClient || require('../orcosts').defaultClient;

  function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    next();
  }

  app.get('/api/admin/orcosts-summary', requireAuth, requireAdmin, async (req, res) => {
    const card = await client.getSummary();
    // Chiffres privés, déjà mis en cache côté serveur : aucun cache
    // intermédiaire ne doit les garder.
    res.set('Cache-Control', 'private, no-store');
    res.json(card);
  });
};
