'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#f59e0b', '#22c55e', '#6366f1', '#ec4899', '#eab308', '#14b8a6', '#f97316'];

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  drift: number;
}

interface ConfettiProps {
  fire: boolean;
  onComplete?: () => void;
}

export default function Confetti({ fire, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!fire) return;

    const newParticles: Particle[] = Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      duration: 2 + Math.random() * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 220,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3200);

    return () => clearTimeout(timer);
  }, [fire]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          style={
            {
              position: 'absolute',
              top: '-5%',
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.45,
              backgroundColor: p.color,
              borderRadius: 2,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              '--drift': `${p.drift}px`,
              transform: `rotate(${p.rotate}deg)`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift)) rotate(720deg);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
