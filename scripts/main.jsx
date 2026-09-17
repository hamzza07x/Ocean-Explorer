import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SettingsProvider } from './Settings.jsx'
import { DiscoveryProvider } from './DiscoverySystem.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/main.css'
import '../styles/ocean.css'
import '../styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <DiscoveryProvider>
        <App />
      </DiscoveryProvider>
    </SettingsProvider>
  </React.StrictMode>
)
