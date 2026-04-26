import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './App.css'
import './styles/auth.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Conditional rendering based on whether Google OAuth is configured
const RootComponent = () => {
  if (!googleClientId) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        marginTop: '2rem'
      }}>
        <h2>⚠️ Configuration Required</h2>
        <p>Google OAuth is not configured.</p>
        <p>Please set <code>VITE_GOOGLE_CLIENT_ID</code> in your <code>.env</code> file.</p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          See GOOGLE_OAUTH_SETUP_GUIDE.md or GOOGLE_OAUTH_QUICK_FIX.md for setup instructions.
        </p>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
)
