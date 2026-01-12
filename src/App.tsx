import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './config/routes';
import MainLayout from './components/layout/MainLayout';
import { PageSkeleton } from './components/ui/Skeleton';

// Fallback de chargement avec skeleton
const LoadingFallback = () => <PageSkeleton />;

export default function App() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>
      </Suspense>
    </MainLayout>
  );
}
