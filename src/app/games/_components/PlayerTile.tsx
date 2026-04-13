// Dispatch is a type from react that describes the shape of the dispatch function
// returned by useReducer. it accepts an Action and returns nothing (void).
// importing it here lets typescript verify that we're calling dispatch correctly.
import { type Dispatch } from "react";
import { type Player } from "@/lib/state";
import { type Action } from "@/lib/session";

type TProps = {
  // the full player object from game state, passed down from GamesPage.
  // previously this component fetched its own data from the server on every render.
  // now the parent owns the state and passes it down as a prop — this is called
  // "lifting state up". it means there is one source of truth (the useReducer in
  // GamesPage) and child components just display what they're given.
  player: Player;
  // dispatch is passed down so this component can trigger state changes.
  // the component doesn't need to know how the reducer works internally —
  // it just describes what happened and the reducer decides what to do with it.
  dispatch: Dispatch<Action>;
};

export default function PlayerTile({ player, dispatch }: TProps) {
  const className: string[] = [];
  if (player.life < 10) {
    className.push("bg-red-200");
  }

  return (
    <div className={className.join(" ")}>
      Player {player.id} life: {player.life}
      <button
        className="bg-slate-500 text-slate-900 rounded-lg px-4 py-0.5"
        // when the button is clicked, we dispatch an ADJUST_LIFE action.
        // dispatch sends this action object to gameReducer, which calculates
        // the new state and gives it back to react. react then re-renders
        // GamesPage and all its children with the updated player life totals.
        // a delta of -1 means "subtract 1 from this player's life".
        onClick={() => dispatch({ type: "ADJUST_LIFE", playerId: player.id, delta: -1 })}
      >
        Decrement
      </button>
    </div>
  );
}
