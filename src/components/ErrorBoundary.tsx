import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl font-bold text-indigo-200 mb-4">Oups</div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Une erreur est survenue</h1>
            <p className="text-gray-600 mb-6">
              Nous nous excusons pour la gêne. Veuillez rafraîchir la page ou revenir à l'accueil.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Rafraîchir
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Accueil
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
