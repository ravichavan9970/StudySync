import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';

export default function LandingPage({ onOpenAdminModal }) {
  const { token, user } = useAuth();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="hero-pill-badge">
            <span>✨ RE-ENGINEERED FOR 2026</span>
            <span className="pill-dot" />
            <span>CLOUD & RENDER READY</span>
          </div>

          <h1 className="landing-title">
            Master Your Studies.<br />
            <span className="text-gradient">Build Unstoppable Momentum.</span>
          </h1>

          <p className="landing-subtitle">
            StudySync is an enterprise student productivity and deep focus platform.
            Organize tasks, capture rich study notes, launch Pomodoro flow sessions, and visualize your weekly mastery trends.
          </p>

          <div className="landing-hero-actions">
            {token ? (
              <Link to="/dashboard" className="btn-primary large">
                Enter Your Workspace →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary large">
                  Start Free Today 🚀
                </Link>
                <Link to="/login" className="btn-outline large">
                  Sign In
                </Link>
              </>
            )}
            <Link to="/admin" className="btn-outline large admin-badge-btn">
              🛡️ Admin Operations
            </Link>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-item">
              <span className="trust-icon">☕</span>
              <div>
                <strong>Spring Boot 3 (Java 21)</strong>
                <small>High Performance Cloud REST API</small>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <div>
                <strong>Two-Tier Security</strong>
                <small>JWT + Master Admin Token</small>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💾</span>
              <div>
                <strong>Disaster Recovery</strong>
                <small>1-Click Auto Backup Engine</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Highlights */}
      <section id="features" className="landing-section">
        <div className="section-title-wrap">
          <span className="section-eyebrow">POWERFUL TOOLKIT</span>
          <h2>Engineered for High-Performing Students</h2>
          <p>Everything you need to excel in exams, manage courses, and protect your focus time.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">📝</div>
            <h3>Smart Task Workspace</h3>
            <p>
              Organize academic goals with priority weights, due dates, course associations, and one-click Pomodoro launch.
            </p>
            <Link to={token ? "/tasks" : "/login"} className="feature-link">
              Explore Tasks →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">⏱️</div>
            <h3>Deep Work & Pomodoro</h3>
            <p>
              Eliminate context switching with 25m/50m flow sessions, circular animated countdown rings, and linked goal completion.
            </p>
            <Link to={token ? "/focus" : "/login"} className="feature-link">
              Launch Focus Room →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📚</div>
            <h3>Knowledge Base & Notes</h3>
            <p>
              Capture markdown notes, formula cheat sheets, and course summaries with instant category filtering and pinning.
            </p>
            <Link to={token ? "/notes" : "/login"} className="feature-link">
              Browse Notes →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📅</div>
            <h3>7-Day Weekly Planner</h3>
            <p>
              Plan your entire study syllabus week-by-week. Add tasks per calendar day and track completion percentages.
            </p>
            <Link to={token ? "/planner" : "/login"} className="feature-link">
              Open Planner →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">📈</div>
            <h3>Productivity Analytics</h3>
            <p>
              Track daily momentum scores, recorded focus minutes, streak counts, and weekly comparative activity trends.
            </p>
            <Link to={token ? "/analytics" : "/login"} className="feature-link">
              View Analytics →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">🛡️</div>
            <h3>Disaster Recovery & Admin</h3>
            <p>
              Dual-storage auto-reconciliation, offline browser vaults, and 1-click JSON snapshot exports for data safety.
            </p>
            <Link to="/admin" className="feature-link">
              Admin Command Hub →
            </Link>
          </div>
        </div>
      </section>

      {/* Study Methodology Section */}
      <section id="methods" className="landing-section methodology-section">
        <div className="methodology-box">
          <div className="section-title-wrap text-left">
            <span className="section-eyebrow">SCIENCE-BACKED FRAMEWORK</span>
            <h2>How StudySync Accelerates Learning</h2>
          </div>

          <div className="steps-row">
            <div className="step-card">
              <span className="step-num">01</span>
              <h4>Deconstruct</h4>
              <p>Break down dense course syllabi into bite-sized actionable priority tasks.</p>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <h4>Focus Deeply</h4>
              <p>Execute distraction-free Pomodoro intervals linked directly to tasks.</p>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <h4>Review & Retain</h4>
              <p>Consolidate knowledge in pinned notes and synthesize formula sheets.</p>
            </div>
            <div className="step-card">
              <span className="step-num">04</span>
              <h4>Measure & Adapt</h4>
              <p>Review weekly momentum scores to optimize your study schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="landing-cta-banner">
        <h2>Ready to transform your academic productivity?</h2>
        <p>Join students using StudySync to master complex subjects and build consistent study habits.</p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={token ? "/dashboard" : "/register"} className="btn-primary large">
            {token ? "Open Workspace →" : "Get Started Free 🚀"}
          </Link>
          <Link to="/admin" className="btn-outline large">
            Admin Hub 🛡️
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
