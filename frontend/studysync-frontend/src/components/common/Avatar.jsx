import React from 'react';
import { resolveImageUrl } from '../../api';

export default function Avatar({ user, size = 'default' }) {
  const rawUrl = user?.profilePictureUrl || 'https://i.postimg.cc/wMf7YsRW/Ravindra-Chavan.png';
  const imgUrl = resolveImageUrl(rawUrl);

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
    return <div className={`avatar-badge ${size === 'large' ? 'large' : ''}`}>{user.avatarBadge}</div>;
  }

  return (
    <div className={`avatar-badge ${size === 'large' ? 'large' : ''}`}>
      {(user?.name || 'S').charAt(0).toUpperCase()}
    </div>
  );
}
