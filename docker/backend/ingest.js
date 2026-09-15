'use strict';
/**
 * Ingestion d'un prospect dans le CRM — logique partagée.
 *
 * Deux appelants, un seul chemin de création :
 *  - POST /api/ingest/contact (routes/webhooks.js), authentifié par secret
 *    partagé, pour les workflows n8n des formulaires ;
 *  - la confirmation du double opt-in newsletter (routes/newsletter.js), qui
 *    appelle la fonction directement : le backend n'a pas à s'envoyer une
 *    requête HTTP à lui-même, ni à faire circuler son propre secret.
 *
 * Les fiches appartiennent TOUJOURS à l'administrateur, jamais au compte démo :
 * c'est ce qui les rend invisibles depuis la démo publique, dont les
 * identifiants sont affichés sur /login. Voir la section « Cloisonnement démo /
 * données réelles » de CLAUDE.md.
 */

const { v4: uuidv4 } = require('uuid');

const ADMIN_EMAIL = 'admin@ainspiration.eu';

class IngestError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'IngestError';
    this.code = code;
  }
}

/**
 * admin@ainspiration.eu d'abord, à défaut le plus ancien administrateur.
 * Deux requêtes explicites, dans cet ordre : un `UNION ALL ... ORDER BY 1`
 * trierait par uuid et ne respecterait donc pas la préférence.
 */
async function resolveOwnerId(client) {
  const named = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [ADMIN_EMAIL]);
  if (named.rows.length) return named.rows[0].id;
  const oldest = await client.query(
    `SELECT id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1`
  );
  return oldest.rows[0] ? oldest.rows[0].id : null;
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * Crée ou met à jour une fiche contact. Idempotent sur l'email, insensible à
 * la casse : un même prospect qui remplit deux formulaires met sa fiche à jour,
 * il n'en crée pas une deuxième.
 *
 * @returns {Promise<{created: boolean, contactId: string, companyId: string|null}>}
 * @throws {IngestError} code 'invalid_email' ou 'no_owner'
 */
async function ingestContact(pool, payload = {}) {
  const email = str(payload.email);
  if (!email || !email.includes('@')) {
    throw new IngestError('invalid_email', 'email requis');
  }

  const firstName = str(payload.first_name);
  const lastName = str(payload.last_name);
  const phone = str(payload.phone);
  const jobTitle = str(payload.job_title);
  const companyName = str(payload.company_name);
  const source = str(payload.source) || 'ingest';
  const notes = str(payload.notes);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ownerId = await resolveOwnerId(client);
    if (!ownerId) {
      await client.query('ROLLBACK');
      throw new IngestError('no_owner', 'aucun utilisateur administrateur');
    }

    // Société : réutilisée si elle existe déjà chez le même propriétaire.
    let companyId = null;
    if (companyName) {
      const found = await client.query(
        'SELECT id FROM companies WHERE LOWER(name) = LOWER($1) AND owner_id = $2 LIMIT 1',
        [companyName, ownerId]
      );
      if (found.rows.length) {
        companyId = found.rows[0].id;
      } else {
        companyId = uuidv4();
        await client.query(
          `INSERT INTO companies (id, name, status, owner_id) VALUES ($1,$2,'active',$3)`,
          [companyId, companyName, ownerId]
        );
      }
    }

    const existing = await client.query(
      'SELECT id FROM contacts WHERE LOWER(email) = LOWER($1) AND owner_id = $2 LIMIT 1',
      [email, ownerId]
    );

    let contactId;
    let created;
    if (existing.rows.length) {
      contactId = existing.rows[0].id;
      created = false;
      // `source` garde la PREMIÈRE provenance connue : c'est celle qui répond à
      // « d'où vient ce prospect ». Les passages suivants n'écrasent rien.
      //
      // Les notes ne sont ajoutées que si elles n'y figurent pas déjà : l'endpoint
      // est idempotent, un même formulaire renvoyé deux fois ne doit pas recopier
      // son message à la suite. Un message réellement différent, lui, s'ajoute.
      await client.query(
        `UPDATE contacts SET
           first_name = COALESCE(NULLIF($1,''), first_name),
           last_name  = COALESCE(NULLIF($2,''), last_name),
           phone      = COALESCE(NULLIF($3,''), phone),
           job_title  = COALESCE(NULLIF($4,''), job_title),
           company_id = COALESCE($5, company_id),
           source     = COALESCE(source, NULLIF($6,'')),
           notes      = CASE
                          WHEN NULLIF($7,'') IS NULL THEN notes
                          WHEN notes IS NULL OR notes = '' THEN $7
                          WHEN POSITION($7 IN notes) > 0 THEN notes
                          ELSE CONCAT_WS(E'\\n', notes, $7)
                        END,
           updated_at = NOW()
         WHERE id = $8`,
        [firstName, lastName, phone, jobTitle, companyId, source, notes, contactId]
      );
    } else {
      contactId = uuidv4();
      created = true;
      await client.query(
        `INSERT INTO contacts (id, first_name, last_name, email, phone, job_title,
                               company_id, source, notes, status, owner_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10)`,
        [contactId, firstName || null, lastName || null, email, phone || null,
         jobTitle || null, companyId, source, notes || null, ownerId]
      );
    }

    await client.query(
      `INSERT INTO activities (id, user_id, type, description, entity_type, entity_id)
       VALUES ($1,$2,$3,$4,'contact',$5)`,
      [uuidv4(), ownerId, created ? 'contact_created' : 'contact_updated',
       `${created ? 'Nouveau contact' : 'Contact mis à jour'} via ${source} : ${email}`,
       contactId]
    );

    await client.query('COMMIT');
    return { created, contactId, companyId };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { ingestContact, IngestError };
