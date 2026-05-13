import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from './DataProviders/AuthProvider.tsx'
import { CareerDataProvider } from './DataProviders/CareerDataProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CareerDataProvider>
        <App />        
      </CareerDataProvider>
    </AuthProvider>
  </StrictMode>,
)
