// Thin wrapper — delegates life display and controls to PlayerLife.
import { type Dispatch } from "react";
import { type Player } from "@/lib/state";
import { type Action } from "@/lib/session";
import LifeDial from "../LifeDial";

type TProps = {
  player: Player;
  dispatch: Dispatch<Action>;
};

export default function Playerboard({ player, dispatch }: TProps) {
  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">{player.displayName}</h2>
      <LifeDial player={player} dispatchAction={dispatch} />
    </div>
  );
}
