import { useState } from 'react';

export default function WeightChart({ referenceCurve, userWeights, preWeight, currentWeek }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!referenceCurve || referenceCurve.length === 0) return null;

  const baseWeight = Number(preWeight) || 60;

  // Determinar limites Y para o gráfico
  const allUserWeights = userWeights.map((w) => Number(w.weight)).filter((w) => !isNaN(w) && w > 0);
  const maxRefWeight = referenceCurve[referenceCurve.length - 1].maxWeight;
  const minRefWeight = baseWeight - 1;

  const maxY = Math.max(maxRefWeight + 2, ...allUserWeights, baseWeight + 10);
  const minY = Math.min(minRefWeight - 2, ...allUserWeights, baseWeight - 2);

  // Dimensões do SVG
  const width = 720;
  const height = 340;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Funções de escala
  const getX = (week) => padding.left + ((week - 1) / 39) * chartWidth;
  const getY = (val) => padding.top + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;

  // Gerar caminho (path) para a faixa recomendada (área sombreada)
  const topPoints = referenceCurve.map((p) => `${getX(p.week)},${getY(p.maxWeight)}`);
  const bottomPoints = [...referenceCurve].reverse().map((p) => `${getX(p.week)},${getY(p.minWeight)}`);
  const areaPath = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;

  const minLinePath = `M ${referenceCurve.map((p) => `${getX(p.week)},${getY(p.minWeight)}`).join(' L ')}`;
  const maxLinePath = `M ${referenceCurve.map((p) => `${getX(p.week)},${getY(p.maxWeight)}`).join(' L ')}`;

  // Ordenar pesos do usuário por semana para desenhar a linha contínua
  const sortedUserWeights = [...userWeights]
    .filter((w) => w.week >= 1 && w.week <= 40 && !isNaN(Number(w.weight)))
    .sort((a, b) => a.week - b.week);

  const userLinePath = sortedUserWeights.length > 1
    ? `M ${sortedUserWeights.map((w) => `${getX(w.week)},${getY(Number(w.weight))}`).join(' L ')}`
    : '';

  // Eixo Y ticks (5 linhas de grade horizontais)
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = minY + (i / (yTicksCount - 1)) * (maxY - minY);
    return Number(val.toFixed(1));
  });

  // Eixo X ticks (semanas principais)
  const xTicks = [1, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Legenda do Gráfico */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid #10b981', display: 'inline-block' }}></span>
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Faixa Recomendada (IOM / MS)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', border: '2px solid white', display: 'inline-block' }}></span>
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Suas Pesagens</span>
        </div>

        {currentWeek && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #9333ea', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>Semana Atual ({currentWeek})</span>
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '550px', height: 'auto', display: 'block' }}
        >
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
              />
              <text
                x={padding.left - 10}
                y={getY(tickVal) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--text-muted)"
                fontWeight="500"
              >
                {tickVal} kg
              </text>
            </g>
          ))}

          {/* Marcadores do Eixo X (Semanas) */}
          {xTicks.map((week) => (
            <g key={week}>
              <line
                x1={getX(week)}
                y1={padding.top}
                x2={getX(week)}
                y2={height - padding.bottom}
                stroke="var(--border)"
                strokeWidth={week === 1 || week === 13 || week === 27 ? '1.5' : '0.5'}
                strokeOpacity="0.7"
              />
              <text
                x={getX(week)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
                fontWeight="500"
              >
                {week === 1 ? '1ª sem' : `${week}`}
              </text>
            </g>
          ))}

          {/* Linha vertical da semana atual */}
          {currentWeek && currentWeek >= 1 && currentWeek <= 40 && (
            <line
              x1={getX(currentWeek)}
              y1={padding.top}
              x2={getX(currentWeek)}
              y2={height - padding.bottom}
              stroke="#9333ea"
              strokeDasharray="4 4"
              strokeWidth="2"
            />
          )}

          {/* Área da Faixa Recomendada */}
          <path d={areaPath} fill="rgba(16, 185, 129, 0.18)" />
          <path d={minLinePath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d={maxLinePath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Linha das Pesagens da Gestante */}
          {userLinePath && (
            <path
              d={userLinePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos das Pesagens com Hover */}
          {sortedUserWeights.map((w) => {
            const cx = getX(w.week);
            const cy = getY(Number(w.weight));
            const isHovered = hoveredPoint?.id === w.id;

            return (
              <g
                key={w.id}
                onMouseEnter={() => setHoveredPoint(w)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 5.5}
                  fill="#2563eb"
                  stroke="white"
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ transition: 'r 0.15s ease' }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip Flutuante */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '20px',
            background: 'var(--surface)',
            border: '1.5px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.85rem',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
            Semana {hoveredPoint.week} ({hoveredPoint.date ? hoveredPoint.date.split('-').reverse().join('/') : ''})
          </div>
          <div style={{ color: 'var(--text-main)' }}>
            Peso: <b>{hoveredPoint.weight} kg</b>
          </div>
          <div style={{ color: Number(hoveredPoint.weight) >= baseWeight ? '#16a34a' : '#ea580c', fontSize: '0.8rem', marginTop: '2px' }}>
            Ganho: <b>{Number(hoveredPoint.weight) >= baseWeight ? '+' : ''}{(Number(hoveredPoint.weight) - baseWeight).toFixed(1)} kg</b>
          </div>
          {hoveredPoint.notes && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
              "{hoveredPoint.notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
