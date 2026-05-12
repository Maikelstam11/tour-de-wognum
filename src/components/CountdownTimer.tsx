'use client';
import { useState, useEffect } from 'react';
import { getCountdownData } from '@/lib/utils';

const TOUR_START = new Date('2026-07-04T10:00:00');

export default function CountdownTimer() {
  const [data, setData] = useState(getCountdownData(TOUR_START));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(getCountdownData(TOUR_START));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (data.isOver) {
    return (
      <div className="font-display text-2xl" style={{ color: 'var(--tour-yellow)' }}>
        🚴 De Tour is begonnen!
      </div>
    );
  }

  const units = [
    { value: data.days, label: 'Dagen' },
    { value: data.hours, label: 'Uren' },
    { value: data.minutes, label: 'Min' },
    { value: data.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
          <div className="text-center">
            <div
              className="font-display text-3xl sm:text-5xl leading-none w-16 sm:w-20 text-center"
              style={{ color: 'var(--tour-yellow)' }}
            >
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--tour-text-muted)' }}>
              {unit.label}
            </div>
          </div>
          {i < units.length - 1 && (
            <div
              className="font-display text-2xl sm:text-4xl pb-4"
              style={{ color: 'var(--tour-yellow)', opacity: 0.5 }}
            >
              :
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
