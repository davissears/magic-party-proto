"use client";

// interactive svg dial for adjusting a player's life total.
// drag clockwise to gain life, counterclockwise to lose it, then click apply.
import { useRef, useState, type Dispatch } from "react";
import { type Player } from "@/lib/game";
import { type Action } from "@/lib/game";

// how many degrees of rotation equal one life point change.
const DEG_PER_LIFE = 18;
const TRACK_RADIUS = 80;
// svg canvas size: diameter plus padding so the handle doesn't clip the edge.
const SVG_SIZE = TRACK_RADIUS * 2 + 40;
const CENTER = SVG_SIZE / 2;

// converts a clockwise-from-top angle (degrees) to an x,y point on the track circle.
function angleDegToPoint(angleDeg: number): [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [
    CENTER + TRACK_RADIUS * Math.cos(rad),
    CENTER + TRACK_RADIUS * Math.sin(rad),
  ];
}

// builds the svg arc path from 12 o'clock to the current handle position.
// returns an empty string when delta is 0 or exactly on a full-revolution boundary.
function buildArcPath(delta: number): string {
  if (delta === 0) return "";
  const totalDeg = delta * DEG_PER_LIFE;
  const arcDeg = Math.abs(totalDeg) % 360;
  if (arcDeg === 0) return "";
  const signedArcDeg = delta > 0 ? arcDeg : -arcDeg;
  const [x, y] = angleDegToPoint(signedArcDeg);
  const largeArcFlag = arcDeg > 180 ? 1 : 0;
  const sweepFlag = delta > 0 ? 1 : 0;
  return `M ${CENTER} ${CENTER - TRACK_RADIUS} A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 ${largeArcFlag} ${sweepFlag} ${x} ${y}`;
}

// returns the pointer's angle in degrees relative to the dial center.
function pointerAngle(svg: SVGSVGElement, clientX: number, clientY: number): number {
  const rect = svg.getBoundingClientRect();
  const scaleX = SVG_SIZE / rect.width;
  const scaleY = SVG_SIZE / rect.height;
  const dx = (clientX - rect.left) * scaleX - CENTER;
  const dy = (clientY - rect.top) * scaleY - CENTER;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

type TProps = {
  player: Player;
  dispatchAction: Dispatch<Action>;
  onApply?: () => void;
  // compact renders the dial at 60% size and hides the life total label.
  compact?: boolean;
};

export default function LifeDial({ player, dispatchAction, onApply, compact = false }: TProps) {
  // delta is the pending life change shown on the dial before the player confirms.
  const [delta, setDelta] = useState(0);
  const isDragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  // tracks the angle from the previous frame to compute incremental rotation.
  const lastAngleRef = useRef(0);
  // total degrees rotated since the current drag started.
  const accumulatedDegRef = useRef(0);

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    isDragging.current = true;
    // pointer capture keeps move/up events firing even if the pointer leaves the svg.
    e.currentTarget.setPointerCapture(e.pointerId);
    if (svgRef.current) {
      lastAngleRef.current = pointerAngle(svgRef.current, e.clientX, e.clientY);
    }
    accumulatedDegRef.current = 0;
    setDelta(0);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDragging.current || !svgRef.current) return;
    const currentAngle = pointerAngle(svgRef.current, e.clientX, e.clientY);
    // normalize the frame-to-frame diff to -180..180 so it handles the ±180 wrap in atan2.
    let diff = currentAngle - lastAngleRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    accumulatedDegRef.current += diff;
    lastAngleRef.current = currentAngle;
    // clockwise = positive delta, counterclockwise = negative; no cap on rotations.
    setDelta(Math.round(accumulatedDegRef.current / DEG_PER_LIFE));
  }

  function handlePointerUp() {
    isDragging.current = false;
  }

  function handleApply() {
    if (delta === 0) return;
    dispatchAction({ type: "ADJUST_LIFE", playerId: player.id, delta });
    setDelta(0);
    accumulatedDegRef.current = 0;
    onApply?.();
  }

  // handle position laps the dial each full revolution (modulo 360).
  const totalDeg = delta * DEG_PER_LIFE;
  const arcDeg = Math.abs(totalDeg) % 360;
  const handleDeg = delta >= 0 ? arcDeg : -arcDeg;
  const [handleX, handleY] = angleDegToPoint(handleDeg);
  const arcPath = buildArcPath(delta);
  // show a full colored ring when the handle is exactly on a revolution boundary.
  const showFullCircle = delta !== 0 && arcDeg === 0;
  // green = gain life, red = lose life — standard mtg convention.
  const arcColor = delta >= 0 ? "#16a34a" : "#dc2626";

  const renderedSize = compact ? SVG_SIZE * 0.6 : SVG_SIZE;

  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {/* life total label — hidden in compact mode since the host card already shows it. */}
      {!compact && <span className="text-6xl font-bold">{player.life}</span>}

      {/* touch-none stops the browser from treating a drag as a page scroll. */}
      <svg
        ref={svgRef}
        width={renderedSize}
        height={renderedSize}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* grey background ring showing the full dial range. */}
        <circle cx={CENTER} cy={CENTER} r={TRACK_RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={12} />

        {/* colored full ring — only shown when delta lands exactly on a revolution boundary. */}
        {showFullCircle && (
          <circle cx={CENTER} cy={CENTER} r={TRACK_RADIUS} fill="none" stroke={arcColor} strokeWidth={12} />
        )}

        {/* arc from 12 o'clock to the handle; green when gaining, red when losing. */}
        {arcPath && (
          <path d={arcPath} fill="none" stroke={arcColor} strokeWidth={12} strokeLinecap="round" />
        )}

        {/* draggable handle dot on the track ring. */}
        <circle cx={handleX} cy={handleY} r={14} fill={delta === 0 ? "#6b7280" : arcColor} stroke="white" strokeWidth={3} />

        {/* pending delta shown in the center of the dial, updates live while dragging. */}
        <text x={CENTER} y={CENTER + 10} textAnchor="middle" fontSize={32} fontWeight="bold" fill={delta === 0 ? "#6b7280" : arcColor}>
          {delta > 0 ? `+${delta}` : delta}
        </text>
      </svg>

      {/* disabled when delta is 0 to prevent submitting a no-op. */}
      <button
        onClick={handleApply}
        disabled={delta === 0}
        className={`${compact ? "w-24 py-1 text-sm" : "w-32 py-2"} rounded-lg text-white font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
        style={{ backgroundColor: delta === 0 ? undefined : arcColor }}
      >
        Apply
      </button>
    </div>
  );
}
