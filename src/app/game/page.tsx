"use client";

// client component — useReducer manages state in the browser, not on the server.
import { useReducer } from "react";
import { createSession, gameReducer } from "@/lib/game";
import Rivalboard from "./_components/rivalboard/Rivalboard";
import Playerboard from "./_components/playerboard/Playerboard";

// created outside the component so the initial session is only built once, not on every re-render.
const initialSession = createSession(["Me", "Rival 1", "Rival 2", "Rival 3"], 40);

export default function GamePage() {
  // session holds the full game state; dispatch sends actions to gameReducer to produce the next state.
  const [session, dispatch] = useReducer(gameReducer, initialSession);

  // player 0 is the local player; the rest are rivals shown in the top bar.
  const localPlayer = session.players[0]!;
  const rivals = session.players.slice(1);

  return (
    <div>
      <div className="flex flex-row gap-4 min-h-[20vh] w-full px-4 items-start">
        {rivals.map(rival => (
          <Rivalboard key={rival.id} player={rival} dispatchAction={dispatch} />
        ))}
      </div>
      <Playerboard player={localPlayer} dispatch={dispatch} />
    </div>
  );
}
