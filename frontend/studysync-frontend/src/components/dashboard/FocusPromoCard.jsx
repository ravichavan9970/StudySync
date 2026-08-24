import React from 'react';
import { Link } from 'react-router-dom';

export default function FocusPromoCard() {
  return (
    <article className="card-box focus-promo-card">
      <span className="card-eyebrow">DEEP FOCUS</span>
      <h3>Ready to study?</h3>
      <p className="focus-promo-desc">
        Eliminate distractions and unlock high retention with our Pomodoro focus mode.
      </p>
      <div className="promo-timer-display">
        25 <small>mins</small>
      </div>
      <Link to="/focus" className="btn-secondary full-width" style={{ textAlign: 'center', textDecoration: 'none' }}>
        Start Focus Session →
      </Link>
    </article>
  );
}
