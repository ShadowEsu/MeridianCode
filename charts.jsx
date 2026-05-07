// Chart labels — same serif stack as Claude-style UI
const CHART_FONT = "Crimson Pro, Georgia, Times New Roman, serif";

function Sparkline({ data, color = '#6366F1', width = 80, height = 24, fill = false }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {fill && <path d={area} fill={color} opacity={0.15} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaChart({ data, color = '#6366F1', height = 220, labels, yPrefix = '$' }) {
  const w = 720;
  const h = height;
  const pad = { l: 44, r: 12, t: 18, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const min = 0;
  const max = Math.max(...data) * 1.15;
  const points = data.map((v, i) => {
    const x = pad.l + (i / (data.length - 1)) * innerW;
    const y = pad.t + innerH - ((v - min) / (max - min)) * innerH;
    return [x, y];
  });

  // Smooth curve via cubic bezier
  const smooth = (pts) => {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const path = smooth(points);
  const area = path + ` L${pad.l + innerW},${pad.t + innerH} L${pad.l},${pad.t + innerH} Z`;

  const yTicks = 4;
  const fmt = (v) => yPrefix + (v >= 1000 ? (v/1000).toFixed(1) + 'k' : v.toFixed(0));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block', fontFamily: CHART_FONT }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...Array(yTicks)].map((_, i) => {
        const y = pad.t + (innerH * i) / (yTicks - 1);
        const v = max - ((max - min) * i) / (yTicks - 1);
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + innerW} y1={y} y2={y} stroke="#1E2128" strokeDasharray="2 4" />
            <text x={pad.l - 8} y={y + 3} fill="#5A616E" fontSize="10" textAnchor="end" fontWeight="300">{fmt(v)}</text>
          </g>
        );
      })}
      {labels && labels.map((l, i) => (
        <text key={i} x={pad.l + (i / (labels.length - 1)) * innerW} y={h - 10} fill="#5A616E" fontSize="10" textAnchor="middle" fontWeight="300">{l}</text>
      ))}
      <path d={area} fill={`url(#g-${color.replace('#','')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Donut({ slices, size = 180, hole = 60 }) {
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 4;
  const total = slices.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const arcs = slices.map((s, i) => {
    const startAng = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const endAng = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = endAng - startAng > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAng), y1 = cy + r * Math.sin(startAng);
    const x2 = cx + r * Math.cos(endAng), y2 = cy + r * Math.sin(endAng);
    const xi1 = cx + hole * Math.cos(startAng), yi1 = cy + hole * Math.sin(startAng);
    const xi2 = cx + hole * Math.cos(endAng), yi2 = cy + hole * Math.sin(endAng);
    return (
      <path key={i}
        d={`M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${hole},${hole} 0 ${large} 0 ${xi1},${yi1} Z`}
        fill={s.color}
        stroke="#0A0B0D" strokeWidth="2"
      />
    );
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {arcs}
    </svg>
  );
}

function HBar({ value, max, color = '#F59E0B', height = 6 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="progress" style={{ height }}>
      <div className="progress-bar" style={{ width: pct + '%', background: color }}></div>
    </div>
  );
}

window.Sparkline = Sparkline;
window.AreaChart = AreaChart;
window.Donut = Donut;
window.HBar = HBar;
