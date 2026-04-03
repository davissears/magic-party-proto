import Button from "./_components/Button";
import PlayerTile from "./_components/PlayerTile";

export default function GamesPage() {
  return (
    <>
      <h1>Game ABCD</h1>
      <Button />
      <div className="flex flex-col gap-y-0.5">
        <PlayerTile playerIndex={0} />
        <PlayerTile playerIndex={1} />
        <PlayerTile playerIndex={2} />
        <PlayerTile playerIndex={3} />
      </div>
    </>
  );
}
