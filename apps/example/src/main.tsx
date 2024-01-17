import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {FuelProvider} from "@fuel-wallet/react";
import { WebauthnConnector } from '@webauthn/connector';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
   <FuelProvider fuelConfig={{
       connectors: [new WebauthnConnector()]
   }} >
       <App />
   </FuelProvider>
  </React.StrictMode>,
)
