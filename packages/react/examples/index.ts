import React, { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('reactApp')!).render(
  createElement(React.StrictMode, {
    children: createElement(App)
  })
)
