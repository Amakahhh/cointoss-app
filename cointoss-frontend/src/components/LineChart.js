import React, { useState, useMemo, useCallback } from 'react';

// Responsive, smoother line chart with gradient fill & external data + tooltip support
// Props:
//  data: [{ t: number (ms), price: number }]
//  height: px
//  loading: boolean
//  source: 'live' | 'mock'
//  interval: string (for future formatting)
const LineChart = ({ data = [], height = 340, loading = false, source = 'live', interval }) => {
  const [hover, setHover] = useState(null); // {x,y, price, t, idx}

  const { min, max } = useMemo(() => {
    if (!data.length) return { min: 0, max: 0 };
    let min = data[0].price, max = data[0].price;
    data.forEach(d => { if (d.price < min) min = d.price; if (d.price > max) max = d.price; });
    if (min === max) { max = min + 1; }
    return { min, max };
  }, [data]);

  const path = useMemo(() => {
    if (data.length < 2) return '';
    const w = 1000; // viewBox width logical units
    const h = 300;  // viewBox height logical units
    const pad = 20;
    const range = max - min;
    const normY = (price) => pad + (1 - (price - min) / range) * (h - 2 * pad);
    const normX = (idx) => pad + (idx / (data.length - 1)) * (w - 2 * pad);

    let d = '';
    data.forEach((pt, i) => {
      const x = normX(i);
      const y = normY(pt.price);
      if (i === 0) d += `M ${x} ${y}`; else d += ` L ${x} ${y}`;
    });

    // Smooth using simple quadratic commands
    const smooth = () => {
      if (data.length < 3) return d;
      let s = '';
      for (let i = 0; i < data.length; i++) {
        const x = normX(i);
        const y = normY(data[i].price);
        if (i === 0) s += `M ${x} ${y}`;
        else if (i < data.length - 1) {
          const nx = normX(i + 1);
            const ny = normY(data[i + 1].price);
            const cx = (x + nx) / 2;
            const cy = (y + ny) / 2;
            s += ` Q ${x} ${y} ${cx} ${cy}`;
        }
      }
      // Ensure last point
      const lx = normX(data.length - 1);
      const ly = normY(data[data.length - 1].price);
      s += ` L ${lx} ${ly}`;
      return s;
    };
    return smooth();
  }, [data, min, max]);

  const handleMove = useCallback((e) => {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const w = rect.width;
    // map to index
    const idx = Math.min(data.length - 1, Math.max(0, Math.round((relX / w) * (data.length - 1))));
    const item = data[idx];
    setHover({ idx, price: item.price, t: item.t });
  }, [data]);

  const handleLeave = () => setHover(null);

  const priceToY = (price) => {
    const h = 300; const pad = 20; const range = max - min;
    return pad + (1 - (price - min) / range) * (h - 2 * pad);
  };

  return (
    <div style={{ width: '100%', height: height, position: 'relative' }}>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        {/* Background grid */}
        <g opacity="0.25">
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={(i*1000)/10} y1={0} x2={(i*1000)/10} y2={300} stroke="var(--border-color)" strokeWidth="1" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i*300)/6} x2={1000} y2={(i*300)/6} stroke="var(--border-color)" strokeWidth="1" />
          ))}
        </g>
        {path && (
          <>
            <path d={path + ' L 980 300 L 20 300 Z'} fill="url(#lineGradient)" opacity="0.4" />
            <path d={path} fill="none" stroke="url(#strokeGradient)" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {/* Hover layer */}
        {hover && data[hover.idx] && (
          <g>
            <line x1={(hover.idx/(data.length-1))*960+20} x2={(hover.idx/(data.length-1))*960+20} y1={0} y2={300} stroke="var(--accent-purple)" strokeDasharray="4 4" strokeWidth="2" opacity="0.6" />
            <circle cx={(hover.idx/(data.length-1))*960+20} cy={priceToY(data[hover.idx].price)} r={8} fill="var(--accent-purple)" opacity="0.25" />
            <circle cx={(hover.idx/(data.length-1))*960+20} cy={priceToY(data[hover.idx].price)} r={4} fill="var(--accent-purple)" />
          </g>
        )}
        {/* Transparent capture rect */}
        <rect x={0} y={0} width={1000} height={300} fill="transparent" style={{ cursor: 'crosshair' }} onMouseMove={handleMove} onMouseLeave={handleLeave} />
      </svg>
      {/* Price labels */}
      <div style={{position:'absolute', top:4, left:8, fontSize:12, color:'var(--text-secondary)'}}>{max.toFixed(2)}</div>
      <div style={{position:'absolute', bottom:4, left:8, fontSize:12, color:'var(--text-secondary)'}}>{min.toFixed(2)}</div>
      {loading && (
        <div style={{position:'absolute', top:8, right:12, fontSize:11, color:'var(--text-secondary)'}}>Loading…</div>
      )}
      {source === 'mock' && !loading && (
        <div style={{position:'absolute', top:8, right:12, fontSize:11, color:'var(--accent-gold)'}}>Simulated</div>
      )}
      {hover && data[hover.idx] && (
        <div style={{position:'absolute', pointerEvents:'none', left: `calc(${(hover.idx/(data.length-1))*100}% + 12px)`, top: 16, background:'var(--card-bg)', border:'1px solid var(--glass-border)', padding:'0.5rem 0.65rem', borderRadius:'.5rem', fontSize:'.65rem', color:'var(--text-primary)', boxShadow:'0 4px 16px rgba(0,0,0,0.4)', backdropFilter:'blur(10px)'}}>
          <div style={{fontWeight:600}}>{data[hover.idx].price.toFixed(2)}</div>
          <div style={{color:'var(--text-secondary)'}}>{new Date(data[hover.idx].t).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

export default LineChart;
