import React, { useMemo, useState, useCallback } from 'react';

// Candlestick chart with external candle data + volume bars + hover tooltip
// Props:
//  candles: [{ time, open, high, low, close, volume }]
//  height
//  loading, source
//  interval
const CandlestickChart = ({ candles = [], height = 340, loading = false, source = 'live', interval }) => {
  const [hover, setHover] = useState(null); // { idx }

  const data = candles.map(c => ({ ...c, bullish: c.close >= c.open }));

  const { min, max } = useMemo(() => {
    if (!data.length) return { min: 0, max: 0 };
    let min = data[0].low, max = data[0].high;
    data.forEach(d => { if (d.low < min) min = d.low; if (d.high > max) max = d.high; });
    if (min === max) max = min + 1;
    return { min, max };
  }, [data]);

  const w = 1000; const h = 300; const padX = 20; const padY = 10;
  const range = max - min || 1;
  const y = (val) => padY + (1 - (val - min)/range) * (h - 2*padY);
  const len = data.length;
  const candleWidth = len > 0 ? ((w - 2*padX) / Math.max(1, len) * 0.6) : 0;
  const maxVolume = useMemo(() => data.reduce((m,c) => c.volume && c.volume > m ? c.volume : m, 0) || 1, [data]);

  const handleMove = useCallback((e) => {
    if (!data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const idx = Math.min(data.length - 1, Math.max(0, Math.round((relX / rect.width) * (data.length - 1))));
    setHover({ idx });
  }, [data]);
  const handleLeave = () => setHover(null);

  return (
    <div style={{ width: '100%', height, position:'relative' }}>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.6)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.05)" />
          </linearGradient>
        </defs>
        {/* Grid */}
        <g opacity="0.25">
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={(i*w)/10} y1={0} x2={(i*w)/10} y2={h} stroke="var(--border-color)" strokeWidth="1" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`h${i}`} x1={0} y1={(i*h)/6} x2={w} y2={(i*h)/6} stroke="var(--border-color)" strokeWidth="1" />
          ))}
        </g>
        {len === 0 && (
          <g>
            <text x="500" y="150" textAnchor="middle" fill="var(--text-secondary)" fontSize="32" fontWeight="600">No Data</text>
          </g>
        )}
        {len > 0 && (
          <>
            {/* Volume bars (bottom 20%) */}
            {data.map((c,i) => {
              const positionRatio = len === 1 ? 0.5 : (i / (len - 1));
              const volHeight = (c.volume / maxVolume) * 60; // 60px tall area
              const x = padX + positionRatio * (w - 2*padX) - (candleWidth/2);
              return (
                <rect key={`vol-${i}`} x={x} y={300 - volHeight} width={candleWidth} height={volHeight} fill="url(#volGradient)" opacity={0.5} />
              );
            })}
            {data.map((c, i) => {
              const positionRatio = len === 1 ? 0.5 : (i / (len - 1));
              const cx = padX + positionRatio * (w - 2*padX);
              const color = c.bullish ? 'url(#bullGradient)' : 'url(#bearGradient)';
              const wickColor = c.bullish ? '#16A34A' : '#EF4444';
              const openY = y(c.open);
              const closeY = y(c.close);
              const highY = y(c.high);
              const lowY = y(c.low);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));
              return (
                <g key={i}>
                  {/* Wick */}
                  <line x1={cx} x2={cx} y1={highY} y2={lowY} stroke={wickColor} strokeWidth={2} />
                  {/* Body */}
                  <rect x={cx - candleWidth/2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} rx={2} />
                </g>
              );
            })}
            {hover && data[hover.idx] && (
              <g>
                <line x1={padX + ( (len===1?0.5:hover.idx/(len-1)) ) * (w - 2*padX)} x2={padX + ( (len===1?0.5:hover.idx/(len-1)) ) * (w - 2*padX)} y1={0} y2={300} stroke="var(--accent-purple)" strokeDasharray="4 4" strokeWidth={2} opacity={0.6} />
              </g>
            )}
            <rect x={0} y={0} width={1000} height={300} fill="transparent" style={{cursor:'crosshair'}} onMouseMove={handleMove} onMouseLeave={handleLeave} />
          </>
        )}
      </svg>
      <div style={{position:'absolute', top:4, left:8, fontSize:12, color:'var(--text-secondary)'}}>{max.toFixed(2)}</div>
      <div style={{position:'absolute', bottom:4, left:8, fontSize:12, color:'var(--text-secondary)'}}>{min.toFixed(2)}</div>
      {loading && (
        <div style={{position:'absolute', top:8, right:12, fontSize:11, color:'var(--text-secondary)'}}>Loading…</div>
      )}
      {source === 'mock' && !loading && (
        <div style={{position:'absolute', top:8, right:12, fontSize:11, color:'var(--accent-gold)'}}>Simulated</div>
      )}
      {hover && data[hover.idx] && (
        <div style={{position:'absolute', pointerEvents:'none', left:`calc(${(hover.idx/(data.length-1))*100}% + 12px)`, top:16, background:'var(--card-bg)', border:'1px solid var(--glass-border)', padding:'0.55rem 0.7rem', borderRadius:'.55rem', fontSize:'.65rem', color:'var(--text-primary)', boxShadow:'0 4px 16px rgba(0,0,0,0.4)', backdropFilter:'blur(10px)'}}>
          <div style={{display:'flex', gap:'.75rem'}}>
            <div>
              <div style={{fontWeight:600}}>O</div>
              <div style={{fontWeight:600}}>H</div>
              <div style={{fontWeight:600}}>L</div>
              <div style={{fontWeight:600}}>C</div>
              <div style={{fontWeight:600}}>Vol</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div>{data[hover.idx].open.toFixed(2)}</div>
              <div>{data[hover.idx].high.toFixed(2)}</div>
              <div>{data[hover.idx].low.toFixed(2)}</div>
              <div>{data[hover.idx].close.toFixed(2)}</div>
              <div>{(data[hover.idx].volume||0).toFixed(2)}</div>
            </div>
          </div>
          <div style={{marginTop:'.35rem', color:'var(--text-secondary)'}}>{new Date(data[hover.idx].time).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
