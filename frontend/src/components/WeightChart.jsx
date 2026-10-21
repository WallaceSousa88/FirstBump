import { useState, useMemo } from 'react';
import { Scale, TrendingUp, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundSynthesizer } from '../utils/soundSynthesizer';

// Gerador de curva cúbica suave Bézier (Spline C1 contínua)
function getCurvedPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  const tension = 0.22;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

export default function WeightChart({ referenceCurve, userWeights, preWeight, currentWeek }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [crosshairX, setCrosshairX] = useState(null);

  const baseWeight = Number(preWeight) || 60;

  // Determinar limites Y para o gráfico
  const allUserWeights = (userWeights || []).map((w) => Number(w.weight)).filter((w) => !isNaN(w) && w > 0);
  const maxRefWeight = referenceCurve && referenceCurve.length > 0 ? referenceCurve[referenceCurve.length - 1].maxWeight : baseWeight + 16;
  const minRefWeight = baseWeight - 1;

  const maxY = Math.max(maxRefWeight + 2, ...allUserWeights, baseWeight + 10);
  const minY = Math.min(minRefWeight - 2, ...allUserWeights, baseWeight - 2);

  // Dimensões do SVG
  const width = 740;
  const height = 360;
  const padding = { top: 35, right: 35, bottom: 50, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Funções de escala
  const getX = (week) => padding.left + ((week - 1) / 39) * chartWidth;
  const getY = (val) => padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  // Pontos e Caminhos da Faixa Recomendada (Área IOM / OMS)
  const topRefPoints = useMemo(() => {
    return (referenceCurve || []).map((p) => ({ x: getX(p.week), y: getY(p.maxWeight) }));
  }, [referenceCurve]);

  const bottomRefPoints = useMemo(() => {
    return (referenceCurve || []).map((p) => ({ x: getX(p.week), y: getY(p.minWeight) }));
  }, [referenceCurve]);

  const areaPath = useMemo(() => {
    if (topRefPoints.length === 0 || bottomRefPoints.length === 0) return '';
    const topStr = topRefPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
    const botStr = [...bottomRefPoints].reverse().map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
    return `M ${topStr} L ${botStr} Z`;
  }, [topRefPoints, bottomRefPoints]);

  const maxLineCurve = useMemo(() => getCurvedPath(topRefPoints), [topRefPoints]);
  const minLineCurve = useMemo(() => getCurvedPath(bottomRefPoints), [bottomRefPoints]);

  // Ordenar pesos do usuário e gerar curva suave
  const sortedUserWeights = useMemo(() => {
    return [...(userWeights || [])]
      .filter((w) => w.week >= 1 && w.week <= 40 && !isNaN(Number(w.weight)))
      .sort((a, b) => a.week - b.week);
  }, [userWeights]);

  const userPoints = useMemo(() => {
    return sortedUserWeights.map((w) => ({
      x: getX(w.week),
      y: getY(Number(w.weight)),
      raw: w,
    }));
  }, [sortedUserWeights]);

  const userLinePath = useMemo(() => getCurvedPath(userPoints), [userPoints]);

  // Área sombreada sob a curva da usuária
  const userAreaPath = useMemo(() => {
    if (userPoints.length < 2) return '';
    const curved = getCurvedPath(userPoints);
    const last = userPoints[userPoints.length - 1];
    const first = userPoints[0];
    const bottomY = getY(minY);
    return `${curved} L ${last.x.toFixed(1)},${bottomY.toFixed(1)} L ${first.x.toFixed(1)},${bottomY.toFixed(1)} Z`;
  }, [userPoints]);

  // Ticks do Eixo Y (5 níveis)
  const yTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count }, (_, i) => {
      const val = minY + (i / (count - 1)) * (maxY - minY);
      return Number(val.toFixed(1));
    });
  }, [minY, maxY]);

  // Ticks do Eixo X (semanas principais)
  const xTicks = [1, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

  const handlePointHover = (w) => {
    setHoveredPoint(w);
    setCrosshairX(getX(w.week));
    soundSynthesizer.playPop();
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
    setCrosshairX(null);
  };

  if (!referenceCurve || referenceCurve.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Legenda Estilizada do Gráfico */}
      <div
        style={{
          display: 'flex',
          gap: '18px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '16px',
          fontSize: '0.82rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '4px',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '1px solid #10b981',
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Faixa Saudável (IOM / Ministério da Saúde)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 6px var(--accent)',
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Suas Pesagens (Curva Bézier)</span>
        </div>

        {currentWeek && currentWeek >= 1 && currentWeek <= 40 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #9333ea', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-muted)' }}>Semana Atual ({currentWeek}ª)</span>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto', width: '100%', borderRadius: 'var(--radius)' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '580px', height: 'auto', display: 'block' }}
        >
          <defs>
            {/* Gradiente da Faixa Saudável */}
            <linearGradient id="healthyRangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
            </linearGradient>

            {/* Gradiente da Curva da Gestante */}
            <linearGradient id="userWeightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>

            {/* Filtro de Brilho */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="var(--accent)" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Linhas de Grade Horizontais */}
          {yTicks.map((tickVal, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={getY(tickVal)}
                x2={width - padding.right}
                y2={getY(tickVal)}
                stroke="var(--border)"
                strokeDasharray="4 4"
                strokeWidth="1"
                strokeOpacity="0.8"
              />
              <text
                x={padding.left - 12}
                y={getY(tickVal) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--text-muted)"
                fontWeight="600"
              >
                {tickVal} kg
              </text>
            </g>
          ))}

          {/* Marcadores do Eixo X (Semanas) */}
          {xTicks.map((w) => (
            <g key={w}>
              <line
                x1={getX(w)}
                y1={padding.top}
                x2={getX(w)}
                y2={height - padding.bottom}
                stroke="var(--border)"
                strokeWidth={w === 1 || w === 13 || w === 27 ? '1.5' : '0.5'}
                strokeOpacity={w === 1 || w === 13 || w === 27 ? '0.9' : '0.4'}
              />
              <text
                x={getX(w)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
                fontWeight="600"
              >
                {w === 1 ? '1ª sem' : `${w}`}
              </text>
            </g>
          ))}

          {/* Faixa das 3 fases gestacionais no rodapé */}
          <text x={getX(7)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">
            1º Trimestre
          </text>
          <text x={getX(20)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">
            2º Trimestre
          </text>
          <text x={getX(33)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="600">
            3º Trimestre
          </text>

          {/* Linha vertical da semana atual */}
          {currentWeek && currentWeek >= 1 && currentWeek <= 40 && (
            <g>
              <line
                x1={getX(currentWeek)}
                y1={padding.top}
                x2={getX(currentWeek)}
                y2={height - padding.bottom}
                stroke="#9333ea"
                strokeDasharray="4 4"
                strokeWidth="2"
              />
              <circle cx={getX(currentWeek)} cy={padding.top} r={3.5} fill="#9333ea" />
            </g>
          )}

          {/* Linha Guia do Cursor (Crosshair) */}
          {crosshairX && (
            <line
              x1={crosshairX}
              y1={padding.top}
              x2={crosshairX}
              y2={height - padding.bottom}
              stroke="var(--accent)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
          )}

          {/* Área e Linhas da Faixa Recomendada */}
          {areaPath && <path d={areaPath} fill="url(#healthyRangeGrad)" />}
          {minLineCurve && <path d={minLineCurve} fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 3" />}
          {maxLineCurve && <path d={maxLineCurve} fill="none" stroke="#10b981" strokeWidth="1.6" strokeDasharray="4 3" />}

          {/* Área Sombreada da Curva da Gestante */}
          {userAreaPath && <path d={userAreaPath} fill="url(#userWeightGrad)" />}

          {/* Linha Bézier Contínua da Gestante com Glow */}
          {userLinePath && (
            <path
              d={userLinePath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Pontos de Pesagem com Micro-Animações */}
          {userPoints.map((pt) => {
            const isHovered = hoveredPoint?.id === pt.raw.id;

            return (
              <g
                key={pt.raw.id}
                onMouseEnter={() => handlePointHover(pt.raw)}
                onMouseLeave={handlePointLeave}
                style={{ cursor: 'pointer' }}
              >
                {/* Aura ao pairar */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={14}
                    fill="var(--accent)"
                    fillOpacity="0.25"
                    className="spin-anim"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7.5 : 5.5}
                  fill="var(--accent)"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 3 : 2}
                  style={{
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip Flutuante Estilo Glassmorphism */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '20px',
            background: 'var(--surface)',
            border: '1.5px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            fontSize: '0.85rem',
            zIndex: 10,
            pointerEvents: 'none',
            minWidth: '220px',
            animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>
              Semana {hoveredPoint.week}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {hoveredPoint.date ? hoveredPoint.date.split('-').reverse().join('/') : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
              {hoveredPoint.weight} kg
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: Number(hoveredPoint.weight) >= baseWeight ? '#10b981' : '#f59e0b',
              }}
            >
              {Number(hoveredPoint.weight) >= baseWeight ? '+' : ''}
              {(Number(hoveredPoint.weight) - baseWeight).toFixed(1)} kg
            </span>
          </div>

          {/* Faixa Esperada para esta semana */}
          {referenceCurve && referenceCurve[hoveredPoint.week - 1] && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                paddingTop: '6px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Faixa ideal:</span>
              <b>
                {referenceCurve[hoveredPoint.week - 1].minWeight.toFixed(1)} -{' '}
                {referenceCurve[hoveredPoint.week - 1].maxWeight.toFixed(1)} kg
              </b>
            </div>
          )}

          {hoveredPoint.notes && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
              "{hoveredPoint.notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
