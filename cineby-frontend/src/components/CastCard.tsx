'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/api';
import type { CastMember } from '@/lib/types';

interface CastCardProps {
  member: CastMember;
}

export default function CastCard({ member }: CastCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex-shrink-0 w-28 sm:w-32 text-center">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-2">
        {member.profile_path && !imgError ? (
          <img
            src={getImageUrl(member.profile_path, 'w300')}
            alt={member.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-white/70 truncate">{member.name}</p>
      <p className="text-xs text-white/40 truncate">{member.character}</p>
    </div>
  );
}
