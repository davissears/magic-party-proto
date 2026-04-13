// "use client" — uses hooks and pointer events.
"use client";

import { useRef, useState } from "react";
import { type Dispatch } from "react";
import { type Player } from "@/lib/state";
import { type Action } from "@/lib/session";

// degrees of rotation per 1 life point.
const DEG_PER_LIFE = 18;
const TRACK_RADIUS = 80;
// canvas size: diameter + 40px padding to prevent clipping.
const SVG_SIZE = TRACK_RADIUS * 2 + 40;
const CENTER = SVG_SIZE / 2;

// converts degrees (0° = top, clockwise) to an [x, y] point on the track circle.
function angleDegToPoint(angleDeg: number): [number, number] {
  // subtract 90° so 0° points up instead of right.
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [
    CENTER + TRACK_RADIUS * Math.cos(rad),
    CENTER + TRACK_RADIUS * Math.sin(rad),
  ];
}

// builds an svg arc from 12 o'clock to the handle position within the current revolution.
// Returns empty string when delta is 0 or exactly on a full-revolution boundary (handled by full-circle element).
function buildArcPath(delta: number): string {
  if (delta === 0) return "";
  const totalDeg = delta * DEG_PER_LIFE;
  // arc angle within the current revolution (0..360).
  const arcDeg = Math.abs(totalDeg) % 360;
  // at a full revolution boundary the full-circle element handles display.
  if (arcDeg === 0) return "";
  const signedArcDeg = delta > 0 ? arcDeg : -arcDeg;
  const [x, y] = angleDegToPoint(signedArcDeg);
  const largeArcFlag = arcDeg > 180 ? 1 : 0;
  const sweepFlag = delta > 0 ? 1 : 0;
  return `M ${CENTER} ${CENTER - TRACK_RADIUS} A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 ${largeArcFlag} ${sweepFlag} ${x} ${y}`;
}

// returns the pointer's angle (in degrees) relative to the dial center.
function pointerAngle(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): number {
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
};

export default function LifeDial({ player, dispatchAction, onApply }: TProps) {
  const [delta, setDelta] = useState(0);
  const isDragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  // tracks last frame's angle so we can compute incremental rotation.
  const lastAngleRef = useRef(0);
  // accumulated rotation in degrees since drag started.
  const accumulatedDegRef = useRef(0);

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    isDragging.current = true;
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

    // frame-to-frame angular change; normalize to -180..180 to handle the
    // ±180° wrap in atan2 without flipping sign.
    let diff = currentAngle - lastAngleRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    accumulatedDegRef.current += diff;
    lastAngleRef.current = currentAngle;

    // clockwise rotation → positive delta, counterclockwise → negative.
    // No cap — any number of rotations accumulates correctly.
    const newDelta = Math.round(accumulatedDegRef.current / DEG_PER_LIFE);
    setDelta(newDelta);
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

  // handle position follows rotation freely — modulo 360 so it laps the dial.
  const totalDeg = delta * DEG_PER_LIFE;
  const arcDeg = Math.abs(totalDeg) % 360;
  const handleDeg = delta >= 0 ? arcDeg : -arcDeg;
  const [handleX, handleY] = angleDegToPoint(handleDeg);
  const arcPath = buildArcPath(delta);
  // show a full colored ring when the handle is exactly on a revolution boundary.
  const showFullCircle = delta !== 0 && arcDeg === 0;
  // green = gain, red = lose — standard MTG convention.
  const arcColor = delta >= 0 ? "#16a34a" : "#dc2626"; // tailwind green-600 / red-600

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* confirmed life total — only updates on apply, not during drag. */}
      <span className="text-6xl font-bold">{player.life}</span>

      {/* touch-none prevents the browser treating a drag as a page scroll. */}
      <svg
        ref={svgRef}
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* grey background ring showing the full dial range. */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={TRACK_RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={12}
        />

        {/* colored arc from 12 o'clock to handle; green = gain, red = lose. */}
        {showFullCircle && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={TRACK_RADIUS}
            fill="none"
            stroke={arcColor}
            strokeWidth={12}
          />
        )}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke={arcColor}
            strokeWidth={12}
            strokeLinecap="round"
          />
        )}

        {/* draggable handle on the track ring. */}
        <circle
          cx={handleX}
          cy={handleY}
          r={14}
          fill={delta === 0 ? "#6b7280" : arcColor}
          stroke="white"
          strokeWidth={3}
        />

        {/* pending delta in the dial center; updates live during drag. */}
        <text
          x={CENTER}
          y={CENTER + 10}
          textAnchor="middle"
          fontSize={32}
          fontWeight="bold"
          fill={delta === 0 ? "#6b7280" : arcColor}
        >
          {delta > 0 ? `+${delta}` : delta}
        </text>
      </svg>

      {/* disabled at delta 0 to prevent no-op submissions. */}
      <button
        onClick={handleApply}
        disabled={delta === 0}
        className="w-32 py-2 rounded-lg text-white font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        style={{ backgroundColor: delta === 0 ? undefined : arcColor }}
      >
        Apply
      </button>
    </div>
  );
}
