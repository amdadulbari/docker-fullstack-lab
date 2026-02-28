/**
 * main.jsx — React 18 application entry point.
 *
 * createRoot() is the React 18 API that enables concurrent features.
 * It replaces the legacy ReactDOM.render() which is deprecated in React 18.
 *
 * StrictMode renders each component twice in development to help surface
 * side effects and deprecated API usage. It has no effect in production.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
