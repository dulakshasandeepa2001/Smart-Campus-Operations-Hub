import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './App.css'
import './styles/auth.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '971390087100-nq1pekkvhenn2898dr3b7fm7dkt1cjcapps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
