// "use client" tells next.js that this component runs in the browser, not on the server.
// by default, next.js runs all components on the server (they generate html and send it to the browser).
// we need the browser here because useReducer is a react hook that manages state —
// state only makes sense on the client, where the user is interacting with the page.
// marking this file as a client component also means every component it imports
// (like PlayerTile) is automatically treated as a client component too, so they
// can safely use event handlers like onClick.
"use client";

import { useReducer } from "react";
import { createSession, gameReducer } from "@/lib/session";
import PlayerTile from "./_components/PlayerTile";

// initialSession is defined outside the component so it is only created once,
// when this module is first loaded by the browser. if it were inside the component
// function, react would recreate it on every re-render — which would reset the
// game every time anything on screen updated. useReducer only reads this value
// once (on first mount), but keeping it outside is the clear, explicit way to
// express that intent.
const initialSession = createSession(["Alice", "Bob", "Carol", "Dave"], 40);

export default function GamesPage() {
  // useReducer is react's built-in tool for managing state through a reducer function.
  // think of it like this: "session" is the current game state, and "dispatch" is a
  // function you call to describe what happened (e.g. a player lost life).
  // react calls gameReducer(currentState, action) and replaces session with whatever
  // gameReducer returns. the component then re-renders automatically with the new state.
  // this replaces the old pattern where mutations happened on the server via server actions
  // and revalidatePath() triggered a full server round-trip to refresh the page.
  const [session, dispatch] = useReducer(gameReducer, initialSession);

  return (
    <>
      <h1>Game ABCD</h1>
      <div className="flex flex-col gap-y-0.5">
        {/* we map over session.players so the ui stays in sync with state.
            if a player is added or removed in the future, this list updates automatically.
            the key prop helps react track which tile belongs to which player
            across re-renders so it doesn't unnecessarily recreate dom nodes. */}
        {session.players.map(player => (
          <PlayerTile key={player.id} player={player} dispatch={dispatch} />
        ))}
      </div>
    </>
  );
}
