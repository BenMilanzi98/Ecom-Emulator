import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Ensure styles.css is imported if it's global and not handled by App.jsx or specific components
// import '../public/styles.css'; // Path might need adjustment depending on Vite's public dir handling

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

