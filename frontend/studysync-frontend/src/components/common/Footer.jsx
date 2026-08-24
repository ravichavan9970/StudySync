import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <div className="brand-logo small"><span>S</span></div>
            <strong>StudySync</strong>
          </div>
          <p className="footer-tagline">
            Enterprise Student Productivity, Smart Scheduling & Momentum Platform.
          </p>
        </div>

        <div className="footer-links-col">
          <strong>Workspace</strong>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tasks">My Tasks</Link>
          <Link to="/notes">Study Notes</Link>
          <Link to="/planner">Weekly Planner</Link>
        </div>

        <div className="footer-links-col">
          <strong>Tools</strong>
          <Link to="/focus">Focus Room</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/login">Student Sign In</Link>
        </div>

        <div className="footer-links-col">
          <strong>Cloud & Security</strong>
          <span className="footer-badge">☕ Spring Boot 3 (Java 21)</span>
          <span className="footer-badge">🛡️ Multi-Tier JWT Security</span>
          <span className="footer-badge">☁️ Render Cloud Ready</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 StudySync Enterprise. Designed & Engineered for ambitious students worldwide.</p>
      </div>
    </footer>
  );
}
