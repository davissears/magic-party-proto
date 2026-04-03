import { getPlayerLife, TPlayerNumber } from "@/lib/database";
import { decrementPlayerLife } from "@/lib/database";
import { revalidatePath } from "next/cache";

type TProps = {
  playerIndex: TPlayerNumber;
};
export default function PlayerTile({ playerIndex }: TProps) {
  async function onClick() {
    "use server";
    decrementPlayerLife("ABCD", playerIndex);
    revalidatePath("/");
  }

  const lifeTotal = getPlayerLife("ABCD", playerIndex);
  const className: string[] = [];
  if (lifeTotal < 10) {
    className.push("bg-red-200");
  }

  return (
    <div className={className.join(" ")}>
      Player {playerIndex} life: {lifeTotal}
      <button
        className={`bg-rose-500 text-rose-900 rounded-sm px-4 py-0.5`}
        onClick={onClick}
      >
        Decrement
      </button>
    </div>
  );
}
