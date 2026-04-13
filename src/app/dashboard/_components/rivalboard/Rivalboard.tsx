"use client";

import { useState, type Dispatch } from "react";
import { type Player } from "@/lib/state";
import { type Action } from "@/lib/session";
import LifeDial from "../LifeDial";

type TProps = {
  player: Player;
  dispatchAction: Dispatch<Action>;
};

export default function Rivalboard({ player, dispatchAction }: TProps) {
  const [showDial, setShowDial] = useState(false);

  const isLowLife = player.life < 10;
  const bgClass = isLowLife ? "bg-red-900" : "bg-red-700";

  return (
    <div className={`${bgClass} flex-1 p-2`}>
      <h2 className="text-white font-bold">{player.displayName}</h2>
      <p className="text-white text-xl">{player.life}</p>
      <button
        onClick={() => setShowDial(prev => !prev)}
        className="mt-2 px-3 py-1 text-sm bg-white text-red-700 font-semibold rounded"
      >
        {showDial ? "Cancel" : "Deal Damage"}
      </button>
      {showDial && (
        <LifeDial
          player={player}
          dispatchAction={dispatchAction}
          onApply={() => setShowDial(false)}
        />
      )}
    </div>
  );
}
