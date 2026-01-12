/**
 * Utilitaires de validation et sanitization pour la sécurité
 */

// Regex patterns pour validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Valide un numéro de téléphone
 */
export const isValidPhone = (phone: string): boolean => {
  if (typeof phone !== 'string') return false;
  // Permettre vide car le téléphone est souvent optionnel
  const trimmed = phone.trim();
  if (trimmed === '') return true;
  return PHONE_REGEX.test(trimmed);
};

/**
 * Valide une URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return URL_REGEX.test(url.trim());
};

/**
 * Sanitize une chaîne pour éviter XSS
 * Échappe les caractères HTML dangereux
 */
export const sanitizeString = (str: string): string => {
  if (!str || typeof str !== 'string') return '';

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char] || char);
};

/**
 * Sanitize HTML pour affichage sécurisé
 * Supprime les balises et attributs dangereux
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';

  // Liste des balises autorisées
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'
  ];

  // Liste des attributs autorisés par balise
  const allowedAttributes: Record<string, string[]> = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id']
  };

  // Supprimer les scripts et événements
  let sanitized = html
    // Supprimer les balises script
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Supprimer les balises style
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Supprimer les attributs d'événements (onclick, onerror, etc.)
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
    // Supprimer javascript: dans les URLs
    .replace(/javascript:/gi, '')
    // Supprimer data: URLs potentiellement dangereuses
    .replace(/data:\s*text\/html/gi, '');

  // Créer un élément temporaire pour parser le HTML
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitized, 'text/html');

      // Parcourir tous les éléments et supprimer les non-autorisés
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
      const nodesToRemove: Element[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Element;
        const tagName = node.tagName.toLowerCase();

        if (!allowedTags.includes(tagName)) {
          nodesToRemove.push(node);
        } else {
          // Supprimer les attributs non autorisés
          const attrs = Array.from(node.attributes);
          for (const attr of attrs) {
            const attrName = attr.name.toLowerCase();
            const tagAllowed = allowedAttributes[tagName] || [];
            const globalAllowed = allowedAttributes['*'] || [];

            if (!tagAllowed.includes(attrName) && !globalAllowed.includes(attrName)) {
              node.removeAttribute(attr.name);
            }

            // Vérifier les URLs dans href et src
            if ((attrName === 'href' || attrName === 'src') && attr.value) {
              const value = attr.value.toLowerCase().trim();
              if (value.startsWith('javascript:') || value.startsWith('data:text/html')) {
                node.removeAttribute(attr.name);
              }
            }
          }

          // Ajouter rel="noopener noreferrer" aux liens externes
          if (tagName === 'a' && node.getAttribute('target') === '_blank') {
            node.setAttribute('rel', 'noopener noreferrer');
          }
        }
      }

      // Remplacer les éléments non autorisés par leur contenu texte
      for (const node of nodesToRemove) {
        const text = document.createTextNode(node.textContent || '');
        node.parentNode?.replaceChild(text, node);
      }

      sanitized = doc.body.innerHTML;
    } catch (e) {
      // Fallback: supprimer toutes les balises
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
  }

  return sanitized;
};

/**
 * Valide et nettoie les données d'un formulaire de contact
 */
export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  subject?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: ContactFormData;
}

export const validateContactForm = (data: ContactFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Sanitize all string inputs
  const sanitizedData: ContactFormData = {
    name: sanitizeString(data.name?.trim() || ''),
    email: data.email?.trim().toLowerCase() || '',
    company: sanitizeString(data.company?.trim() || ''),
    phone: data.phone?.trim() || '',
    message: sanitizeString(data.message?.trim() || ''),
    subject: sanitizeString(data.subject?.trim() || '')
  };

  // Validate name
  if (!sanitizedData.name || sanitizedData.name.length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères';
  } else if (sanitizedData.name.length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères';
  }

  // Validate email
  if (!sanitizedData.email) {
    errors.email = 'L\'email est requis';
  } else if (!isValidEmail(sanitizedData.email)) {
    errors.email = 'Veuillez entrer une adresse email valide';
  }

  // Validate phone (optional)
  if (sanitizedData.phone && !isValidPhone(sanitizedData.phone)) {
    errors.phone = 'Veuillez entrer un numéro de téléphone valide';
  }

  // Validate message
  if (!sanitizedData.message || sanitizedData.message.length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères';
  } else if (sanitizedData.message.length > 5000) {
    errors.message = 'Le message ne peut pas dépasser 5000 caractères';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

/**
 * Rate limiting simple côté client
 * Retourne true si l'action est autorisée
 */
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

export const checkRateLimit = (
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || now > record.resetTime) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

/**
 * Génère un nonce pour CSP
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};
