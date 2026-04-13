// Display-only — rivals manage their own life on their own devices.
import { type Player } from "@/lib/state";

type TProps = {
  player: Player;
};

export default function Rivalboard({ player }: TProps) {
  const classNames = ["bg-red-700", "flex-1", "h-full", "p-2"];
  if (player.life < 10) {
    // darker red when life is low so it's easy to notice at a glance.
    classNames.push("bg-red-900");
  }

  return (
    <div className={classNames.join(" ")}>
      <h2 className="text-white font-bold">{player.displayName}</h2>
      <p className="text-white text-xl">{player.life}</p>
    </div>
  );
}
