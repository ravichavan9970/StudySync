import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../../api';

export default function Avatar({ user, size = 'default' }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = resolveImageUrl(user?.profilePictureUrl);

  useEffect(() => {
    setImgError(false);
  }, [imgUrl]);

  if (imgUrl && !imgError) {
    return (
      <img
        className={`avatar-img ${size === 'large' ? 'large' : ''}`}
        src={imgUrl}
        alt={user?.name || 'Profile'}
        onError={() => setImgError(true)}
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
