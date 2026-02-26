/**
 * Configuration d'environnement centralisée
 */

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  appEnv: (import.meta.env.VITE_APP_ENV || 'production') as string,
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: (import.meta.env.VITE_LOG_LEVEL || 'error') as string,
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://ainspiration.eu') as string,
  analyticsEnabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

export const isDev = env.appEnv === 'development';
export const isProd = env.appEnv === 'production';

const noop = () => {};

export const logger = {
  debug: env.debug ? console.debug.bind(console) : noop,
  info: env.debug ? console.info.bind(console) : noop,
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};
