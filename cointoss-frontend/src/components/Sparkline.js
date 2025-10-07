import React, { useMemo } from 'react';

// Simple sparkline component for small profit over time visualization
// Props: data (array of numbers), width, height, stroke, fill, smooth
const Sparkline = ({ data = [], width = 160, height = 50, stroke = 'var(--accent-green)', fill = 'rgba(34,197,94,0.15)', smooth = true }) => {
  const { path, min, max, last } = useMemo(() => {
    if (!data.length) return { path: '', min: 0, max: 0, last: 0 };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * (width - 2) + 1;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return { x, y };
    });

    let d = '';
    if (smooth && points.length > 1) {
      d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const cx = (p0.x + p1.x) / 2;
        d += ` Q ${p0.x} ${p0.y} ${cx} ${ (p0.y + p1.y) / 2 }`;
      }
      d += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
    } else {
      d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }

    return { path: d, min, max, last: data[data.length - 1] };
  }, [data, width, height, smooth]);

  if (!data.length) {
    return <div style={{ fontSize: '.65rem', color: 'var(--text-secondary)' }}>No Data</div>;
  }

  const positive = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="url(#sparkline-fill)" opacity={0.6} />
      <path d={path} fill="none" stroke={positive ? 'var(--accent-green)' : 'var(--accent-red)'} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={width - 3} cy={height - ((last - min) / (max - min || 1)) * (height - 2) - 1} r={3} fill={positive ? 'var(--accent-green)' : 'var(--accent-red)'} />
    </svg>
  );
};

export default Sparkline;
