import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  handleReset = () => {
    if (window.confirm("This will clear all local data to fix the app. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center font-sans">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
               <line x1="12" y1="8" x2="12" y2="12"></line>
               <line x1="12" y1="16" x2="12.01" y2="16"></line>
             </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-white/50 mb-8 max-w-xs mx-auto">The application encountered a critical error. Try reloading or resetting data.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 font-bold transition-colors"
            >
              Reload
            </button>
            <button 
              onClick={this.handleReset} 
              className="px-6 py-3 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 font-bold transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}