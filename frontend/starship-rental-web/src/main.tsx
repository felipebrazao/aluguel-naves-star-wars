import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'flyonui/flyonui'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
