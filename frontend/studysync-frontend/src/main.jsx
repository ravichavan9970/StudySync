import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './App.css';

// Purge any legacy demo/mock data and cached demo images on startup
try {
  const CURRENT_BUILD_VERSION = 'v2.2_clean_prod_final';
  if (localStorage.getItem('studysync_app_version') !== CURRENT_BUILD_VERSION) {
    localStorage.removeItem('studysync_demo_notes');
    localStorage.removeItem('studysync_demo_tasks');
    localStorage.removeItem('studysync_demo_subjects');
    localStorage.removeItem('studysync_demo_categories');
    localStorage.removeItem('studysync_demo_sessions');
    localStorage.removeItem('studysync_demo_user');
    localStorage.removeItem('studysync_users_map');
    localStorage.removeItem('studysync-user-name');
    localStorage.setItem('studysync_app_version', CURRENT_BUILD_VERSION);
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
