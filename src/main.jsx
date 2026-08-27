import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { captureAttribution } from './attribution'

// Before the first render: the landing URL's utm_*/gclid params and the
// referrer are the only evidence of where this visitor came from, and this is
// the earliest moment to bank them. See attribution.js.
captureAttribution()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
