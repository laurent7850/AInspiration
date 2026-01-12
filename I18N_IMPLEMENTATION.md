# Implementation Guide: Bilingual Website (French/English)

## Overview
This document describes the implementation of a complete bilingual system (FR/EN) for the website, based on i18next.

## What Has Been Done

### 1. Core i18n Configuration ✅
- **File**: `src/i18n.ts`
- **Languages**: French (default) and English
- **Features**:
  - Automatic language detection (query string, cookie, localStorage, browser)
  - Automatic persistence of language choice in localStorage
  - JSON-based translation files organized by namespace

### 2. Translation Files Created ✅

All translation files are located in `public/locales/{lang}/{namespace}.json`:

#### French (`/public/locales/fr/`)
- `common.json` - Common texts (navigation, buttons, footer, stats)
- `analysis.json` - AI analysis page
- `recommendations.json` - Recommendations page
- `features.json` - Features section
- `audit.json` - AI audit section and form
- `dashboard.json` - Dashboard metrics
- `prompts.json` - Prompt library
- `collaboration.json` - Team collaboration
- `training.json` - AI training
- `content.json` - Content writing
- `support.json` - Support
- `auth.json` - Authentication (login/signup)
- `pricing.json` - Pricing plans
- `crm.json` - CRM system (dashboard, contacts, companies, opportunities)
- `forms.json` - Common forms (contact, auth, newsletter)

#### English (`/public/locales/en/`)
- All the same files as French with complete professional translations

### 3. Language Selector ✅
- **Location**: Navigation menu (desktop and mobile)
- **File**: `src/components/layout/NavMenu.tsx`
- **Features**:
  - Dropdown selector in desktop view
  - Button selector in mobile view
  - Visual indicator of current language
  - Persists choice automatically

### 4. Blog Multilingual Support ✅
- **Database Migration**: `supabase/migrations/add_multilingual_support_to_blog.sql`
- **New Columns**:
  - `blog_posts.language` - Post language (fr/en)
  - `blog_posts.title_en` - English title
  - `blog_posts.content_en` - English content
  - `blog_posts.excerpt_en` - English excerpt
  - `blog_posts.slug_en` - English URL slug
  - `blog_comments.language` - Comment language
- **Indexes**: Optimized for language-based queries

### 5. Build Status ✅
- Project builds successfully
- All TypeScript types are valid
- No compilation errors

## How to Use i18n in Components

### Basic Usage

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('namespace');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### Multiple Namespaces

```tsx
const { t: tCommon } = useTranslation('common');
const { t: tForms } = useTranslation('forms');

<button>{tCommon('button.save')}</button>
<input placeholder={tForms('contact.placeholders.email')} />
```

### Change Language Programmatically

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <button onClick={() => changeLanguage('en')}>
      English
    </button>
  );
}
```

## Components That Need Translation

Many components still contain hardcoded French text. Here are the priority files:

### HIGH PRIORITY
1. ✅ `src/components/layout/NavMenu.tsx` - Partially done, needs menu items
2. `src/components/Hero.tsx` - Main hero section
3. `src/components/Footer.tsx` - Footer links and text
4. `src/components/auth/SignInForm.tsx` - Login form
5. `src/components/auth/SignUpForm.tsx` - Signup form
6. `src/components/StartForm.tsx` - Contact/Lead form

### MEDIUM PRIORITY
7. `src/components/Features.tsx` - Features section
8. `src/components/AuditSection.tsx` - Audit section
9. `src/components/Newsletter.tsx` - Newsletter subscription
10. `src/components/CookieBanner.tsx` - Cookie consent
11. `src/components/PrivacyPolicy.tsx` - Privacy policy

### CRM COMPONENTS (Translation files ready)
12. `src/components/crm/DashboardView.tsx`
13. `src/components/crm/ContactForm.tsx`
14. `src/components/crm/CompanyForm.tsx`
15. `src/components/crm/OpportunityForm.tsx`
16. `src/components/crm/ContactList.tsx`
17. `src/components/crm/CrmQuickLinks.tsx`

## Translation Keys Naming Convention

Follow this consistent pattern:

```json
{
  "section": {
    "title": "Section Title",
    "subtitle": "Section subtitle",
    "action": "Action Button",
    "items": {
      "item1": "First item",
      "item2": "Second item"
    }
  }
}
```

## CRITICAL RULES FOR FUTURE DEVELOPMENT

### 🚨 MANDATORY RULES

1. **NO Hardcoded Strings**
   - NEVER add French or English text directly in components
   - ALWAYS use translation keys via `t('key')`

2. **Bilingual Requirement**
   - EVERY new feature MUST have both FR and EN translations
   - Add translation keys to BOTH language files simultaneously

3. **Missing Keys = Error**
   - Any missing translation key is considered a bug
   - Test in both languages before deploying

4. **Use Proper Namespaces**
   - Group related translations in appropriate namespaces
   - Create new namespaces for new major features

5. **Professional Translations**
   - Translations must be professional and natural
   - Not word-for-word, but meaning-for-meaning
   - Maintain consistent tone and terminology

## Example: Converting a Component

### Before (Hardcoded)
```tsx
function Hero() {
  return (
    <div>
      <h1>L'Intelligence Artificielle au service de votre croissance</h1>
      <button>Commencer</button>
    </div>
  );
}
```

### After (i18n)

1. Add to `public/locales/fr/common.json`:
```json
{
  "hero": {
    "title": "L'Intelligence Artificielle au service de votre croissance",
    "cta": "Commencer"
  }
}
```

2. Add to `public/locales/en/common.json`:
```json
{
  "hero": {
    "title": "Artificial Intelligence for your growth",
    "cta": "Get Started"
  }
}
```

3. Update component:
```tsx
import { useTranslation } from 'react-i18next';

function Hero() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <button>{t('hero.cta')}</button>
    </div>
  );
}
```

## Testing Checklist

Before deploying any changes:

- [ ] Test page in French
- [ ] Test page in English
- [ ] Switch languages while on the page
- [ ] Verify language persists on page reload
- [ ] Check that no text is hardcoded
- [ ] Verify all buttons and forms work in both languages
- [ ] Test mobile and desktop views

## Database Schema for Multilingual Content

For content stored in the database (like blog posts):

```sql
-- French is stored in main columns
title TEXT,
content TEXT,
slug TEXT,

-- English in separate columns
title_en TEXT,
content_en TEXT,
slug_en TEXT,

-- Track language
language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en'))
```

Query pattern:
```typescript
const { data } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('language', currentLanguage)
  .eq('published', true);
```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- Translation files location: `public/locales/{lang}/{namespace}.json`
- i18n configuration: `src/i18n.ts`

## Support

For questions about the i18n implementation, refer to:
1. This document
2. Existing translated components (e.g., `NavMenu.tsx`)
3. Translation files in `public/locales/`

---

**Last Updated**: December 2024
**Status**: ✅ Core system implemented, components migration in progress
