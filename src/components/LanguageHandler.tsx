import { Routes, Route } from 'react-router-dom';
import routes from '../config/routes';

/**
 * Wraps all routes under a language prefix (/en/*, /nl/*).
 * Renders nested routes with relative paths so react-router resolves them
 * correctly. Language synchronization is handled by LanguageSync in App.tsx.
 */
export default function LanguageHandler() {
  return (
    <Routes>
      {routes.map((route) => {
        // Home route → index route in nested context
        if (route.path === '/') {
          return (
            <Route key="index" index element={<route.component />} />
          );
        }
        // Wildcard stays as-is
        if (route.path === '*') {
          return (
            <Route key="wildcard" path="*" element={<route.component />} />
          );
        }
        // Strip leading / for relative nested routes
        const relativePath = route.path.replace(/^\//, '');
        return (
          <Route
            key={route.path}
            path={relativePath}
            element={<route.component />}
          />
        );
      })}
    </Routes>
  );
}
