import Playerboard from "./_components/playerboard/page";
import Rivalboard from "./_components/rivalboard/page";

export default function Dashboard() {
  return (
    <div>
      <h1>dashboard</h1>
      <div>
        <Rivalboard />
        <Rivalboard />
        <Rivalboard />
      </div>
      <div>
        <Playerboard />
      </div>
    </div>
  );
}
