import type { HoverState } from '../lib/halfcourt/Interfaces';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatPct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export default function ShotTooltip({
  hover,
  containerRef,
}: {
  hover: NonNullable<HoverState>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { clientX, clientY, cell, gx, gy } = hover;

  const rect = containerRef.current?.getBoundingClientRect();
  const left0 = rect ? clientX - rect.left : clientX;
  const top0 = rect ? clientY - rect.top : clientY;

  const offsetX = 12;
  const offsetY = 12;

  const width = 190; // approximate tooltip size for clamping
  const height = 110;

  const left = rect
    ? clamp(left0 + offsetX, 8, rect.width - width - 8)
    : left0 + offsetX;
  const top = rect
    ? clamp(top0 + offsetY, 8, rect.height - height - 8)
    : top0 + offsetY;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        pointerEvents: 'none',
        background: 'rgba(20,20,20,0.92)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 10,
        padding: '10px 12px',
        fontSize: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <div style={{ fontWeight: 700 }}>Shot Zone</div>
        <div style={{ opacity: 0.75 }}>
          {gx}, {gy} ft
        </div>
      </div>

      {cell ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ opacity: 0.8 }}>FG%</span>
            <span style={{ fontWeight: 700 }}>{formatPct(cell.fg)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ opacity: 0.8 }}>Makes / Att</span>
            <span>
              {cell.made} / {cell.att}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ opacity: 0.8 }}>Expected pts</span>
            <span>{cell.pts.toFixed(2)}</span>
          </div>
        </>
      ) : (
        <div style={{ opacity: 0.75 }}>
          No data (low attempts)
          <div style={{ marginTop: 6, opacity: 0.6 }}>
            Try closer to common spots
          </div>
        </div>
      )}
    </div>
  );
}
