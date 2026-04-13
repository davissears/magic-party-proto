// "use client" propagates to all imported components (Rivalboard, Playerboard).
"use client";

import { useReducer } from "react";
import { createSession, gameReducer } from "@/lib/session";
import Rivalboard from "./_components/rivalboard/Rivalboard";
import Playerboard from "./_components/playerboard/Playerboard";

// initialized outside the component so it's computed once, not on every re-render.
// player 0 is the local player; players 1–3 are rivals (local for now).
const initialSession = createSession(["Me", "Rival 1", "Rival 2", "Rival 3"], 40);

export default function Dashboard() {
  const [session, dispatch] = useReducer(gameReducer, initialSession);

  const localPlayer = session.players[0]!;
  const rivals = session.players.slice(1);

  return (
    <div>
      <h1>dashboard</h1>

      <div className="flex flex-row gap-4 h-[20vh] w-full px-4">
        {rivals.map(rival => (
          <Rivalboard key={rival.id} player={rival} dispatchAction={dispatch} />
        ))}
      </div>

      <div>
        <Playerboard player={localPlayer} dispatch={dispatch} />
      </div>
    </div>
  );
}
