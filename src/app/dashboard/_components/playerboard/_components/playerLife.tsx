// "use client" — uses hooks and pointer events.
"use client";

import { useRef, useState } from "react";
import { type Dispatch } from "react";
import { type Player } from "@/lib/state";
import { type Action } from "@/lib/session";

const MAX_DELTA = 20;
const TRACK_RADIUS = 80;
// canvas size: diameter + 40px padding to prevent clipping.
const SVG_SIZE = TRACK_RADIUS * 2 + 40;
const CENTER = SVG_SIZE / 2;


// maps delta (-MAX_DELTA..+MAX_DELTA) to degrees (0° = top, ±180° = bottom).
function deltaToAngleDeg(delta: number): number {
  return (delta / MAX_DELTA) * 180;
}

// converts degrees (0° = top, clockwise) to an [x, y] point on the track circle.
function angleDegToPoint(angleDeg: number): [number, number] {
  // subtract 90° so 0° points up instead of right.
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [
    CENTER + TRACK_RADIUS * Math.cos(rad),
    CENTER + TRACK_RADIUS * Math.sin(rad),
  ];
}

// builds an svg arc from 12 o'clock to the handle position; empty string at delta 0.
function buildArcPath(delta: number): string {
  if (delta === 0) return "";
  const angleDeg = deltaToAngleDeg(delta);
  const [x, y] = angleDegToPoint(angleDeg);
  const largeArcFlag = Math.abs(angleDeg) > 180 ? 1 : 0;
  const sweepFlag = delta > 0 ? 1 : 0;
  return `M ${CENTER} ${CENTER - TRACK_RADIUS} A ${TRACK_RADIUS} ${TRACK_RADIUS} 0 ${largeArcFlag} ${sweepFlag} ${x} ${y}`;
}

type TProps = {
  player: Player;
  dispatchAction: Dispatch<Action>;
};

export default function PlayerLife({ player, dispatchAction }: TProps) {
  const [delta, setDelta] = useState(0);
  // ref instead of state — changes shouldn't trigger re-renders.
  const isDragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // converts screen pointer coordinates to a delta value on the dial.
  function pointerToDelta(clientX: number, clientY: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;

    const rect = svg.getBoundingClientRect();
    // scale pointer coords to svg units in case the element is rendered at a different size.
    const scaleX = SVG_SIZE / rect.width;
    const scaleY = SVG_SIZE / rect.height;

    const dx = (clientX - rect.left) * scaleX - CENTER;
    const dy = (clientY - rect.top) * scaleY - CENTER;

    // +90° rotates so 0° = top; normalize to -180°..+180° so left half = negative.
    let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angleDeg > 180) angleDeg -= 360;

    const raw = (angleDeg / 180) * MAX_DELTA;
    return Math.round(Math.max(-MAX_DELTA, Math.min(MAX_DELTA, raw)));
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    isDragging.current = true;
    // pointer capture keeps events coming even if the pointer leaves the svg.
    e.currentTarget.setPointerCapture(e.pointerId);
    setDelta(pointerToDelta(e.clientX, e.clientY));
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDragging.current) return;
    setDelta(pointerToDelta(e.clientX, e.clientY));
  }

  function handlePointerUp() {
    isDragging.current = false;
  }

  function handleApply() {
    if (delta === 0) return;
    dispatchAction({ type: "ADJUST_LIFE", playerId: player.id, delta });
    setDelta(0);
  }

  const angleDeg = deltaToAngleDeg(delta);
  const [handleX, handleY] = angleDegToPoint(angleDeg);
  const arcPath = buildArcPath(delta);
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
        className="touch-none cursor-grab active:cursor-grabbing"
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
