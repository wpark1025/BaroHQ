'use client';

import type { AgentAppearance } from '@/lib/types';

interface PixelCharacterProps {
  appearance: AgentAppearance;
  size?: number;
  animate?: boolean;
  direction?: 'left' | 'right';
}

export default function PixelCharacter({
  appearance,
  size = 48,
  animate = true,
  direction = 'right',
}: PixelCharacterProps) {
  const px = size / 16; // base pixel unit
  const flip = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

  return (
    <div
      className={`relative ${animate ? 'animate-pixel-idle' : ''}`}
      style={{
        width: size,
        height: size * 1.5,
        transform: flip,
        imageRendering: 'pixelated',
      }}
    >
      {/* Hair (top of head) */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: px * 3,
          width: px * 10,
          height: px * 4,
          backgroundColor: appearance.hair,
          borderRadius: `${px}px ${px}px 0 0`,
        }}
      />
      {/* Hair sides */}
      <div
        className="absolute"
        style={{
          top: px * 3,
          left: px * 2,
          width: px * 2,
          height: px * 5,
          backgroundColor: appearance.hair,
        }}
      />
      <div
        className="absolute"
        style={{
          top: px * 3,
          left: px * 12,
          width: px * 2,
          height: px * 5,
          backgroundColor: appearance.hair,
        }}
      />

      {/* Head / Face */}
      <div
        className="absolute"
        style={{
          top: px * 3,
          left: px * 4,
          width: px * 8,
          height: px * 7,
          backgroundColor: appearance.skin,
        }}
      />

      {/* Eyes */}
      <div
        className="absolute animate-blink"
        style={{
          top: px * 5,
          left: px * 5,
          width: px * 2,
          height: px * 2,
          backgroundColor: '#1e293b',
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute animate-blink"
        style={{
          top: px * 5,
          left: px * 9,
          width: px * 2,
          height: px * 2,
          backgroundColor: '#1e293b',
          borderRadius: '50%',
        }}
      />

      {/* Mouth */}
      <div
        className="absolute"
        style={{
          top: px * 8,
          left: px * 6,
          width: px * 4,
          height: px * 1,
          backgroundColor: '#9f1239',
          borderRadius: px,
        }}
      />

      {/* Shirt / Body */}
      <div
        className="absolute"
        style={{
          top: px * 10,
          left: px * 3,
          width: px * 10,
          height: px * 7,
          backgroundColor: appearance.shirt,
        }}
      />

      {/* Arms */}
      <div
        className="absolute"
        style={{
          top: px * 11,
          left: px * 1,
          width: px * 2,
          height: px * 5,
          backgroundColor: appearance.shirt,
        }}
      />
      <div
        className="absolute"
        style={{
          top: px * 11,
          left: px * 13,
          width: px * 2,
          height: px * 5,
          backgroundColor: appearance.shirt,
        }}
      />

      {/* Hands */}
      <div
        className="absolute"
        style={{
          top: px * 15,
          left: px * 1,
          width: px * 2,
          height: px * 2,
          backgroundColor: appearance.skin,
        }}
      />
      <div
        className="absolute"
        style={{
          top: px * 15,
          left: px * 13,
          width: px * 2,
          height: px * 2,
          backgroundColor: appearance.skin,
        }}
      />

      {/* Pants / Legs */}
      <div
        className="absolute"
        style={{
          top: px * 17,
          left: px * 3,
          width: px * 4,
          height: px * 5,
          backgroundColor: appearance.pants,
        }}
      />
      <div
        className="absolute"
        style={{
          top: px * 17,
          left: px * 9,
          width: px * 4,
          height: px * 5,
          backgroundColor: appearance.pants,
        }}
      />

      {/* Shoes */}
      <div
        className="absolute"
        style={{
          top: px * 22,
          left: px * 2,
          width: px * 5,
          height: px * 2,
          backgroundColor: '#374151',
        }}
      />
      <div
        className="absolute"
        style={{
          top: px * 22,
          left: px * 9,
          width: px * 5,
          height: px * 2,
          backgroundColor: '#374151',
        }}
      />
    </div>
  );
}
