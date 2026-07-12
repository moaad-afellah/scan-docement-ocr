import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.fallbackCustom()) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
            <h1 className="text-4xl font-extrabold text-red-600 dark:text-red-500 mb-4">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              An unexpected error occurred. Please try reloading the application.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private fallbackCustom() {
    return this.props.fallback !== undefined;
  }
}
