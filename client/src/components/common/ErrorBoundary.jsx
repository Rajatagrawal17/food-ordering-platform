import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          backgroundColor: '#fafafa',
          color: '#333'
        }}>
          <h1 style={{ color: '#ff5722', fontSize: '2.5rem', marginBottom: '10px' }}>Something went wrong</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#666' }}>
            We encountered an unexpected error. Please try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              backgroundColor: '#ff5722',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
