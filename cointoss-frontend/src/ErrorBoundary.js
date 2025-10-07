import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // Log to console (could be extended to remote logging)
    console.error('Runtime error captured by ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:'2rem', fontFamily:'monospace', color:'#f87171'}}>
          <h2 style={{marginTop:0}}>Something went wrong.</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error.message}</pre>
          <button onClick={() => window.location.reload()} style={{
            marginTop:'1rem',
            background:'#1f2937',
            color:'#fff',
            border:'1px solid #374151',
            padding:'.6rem 1rem',
            borderRadius:'.5rem',
            cursor:'pointer'
          }}>Reload</button>
        </div>
      );
    }
    return this.props.children;  
  }
}

export default ErrorBoundary;
