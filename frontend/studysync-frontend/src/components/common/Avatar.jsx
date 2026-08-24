import React from 'react';
import { resolveImageUrl } from '../../api';

export default function Avatar({ user, size = 'default' }) {
  const imgUrl = resolveImageUrl(user?.profilePictureUrl);

  if (imgUrl) {
    return (
      <img
        className={`avatar-img ${size === 'large' ? 'large' : ''}`}
        src={imgUrl}
        alt={user?.name || 'Profile'}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }

  if (user?.avatarBadge) {
    return (
      <div className={`avatar-badge ${size === 'large' ? 'large' : ''}`}>
        {user.avatarBadge}
      </div>
    );
  }

  const initial = (user?.name || 'S').trim().charAt(0).toUpperCase();

  return (
    <div className={`avatar-badge ${size === 'large' ? 'large' : ''}`}>
      {initial}
    </div>
  );
}
