import { Routes, Route } from 'react-router-dom';
import routes from '../config/routes';
import PrivateRoute from './PrivateRoute';

/**
 * Wraps all routes under a language prefix (/en/*, /nl/*).
 * Renders nested routes with relative paths so react-router resolves them
 * correctly. Language synchronization is handled by LanguageSync in App.tsx.
 */
export default function LanguageHandler() {
  const wrapElement = (route: typeof routes[0]) => {
    const el = <route.component />;
    return route.private ? <PrivateRoute>{el}</PrivateRoute> : el;
  };

  return (
    <Routes>
      {routes.map((route) => {
        // Home route → index route in nested context
        if (route.path === '/') {
          return (
            <Route key="index" index element={wrapElement(route)} />
          );
        }
        // Wildcard stays as-is
        if (route.path === '*') {
          return (
            <Route key="wildcard" path="*" element={wrapElement(route)} />
          );
        }
        // Strip leading / for relative nested routes
        const relativePath = route.path.replace(/^\//, '');
        return (
          <Route
            key={route.path}
            path={relativePath}
            element={wrapElement(route)}
          />
        );
      })}
    </Routes>
  );
}
