// import { incrementCounter } from "@/lib/database";

export default function Button() {
  async function onClick() {
    "use server";
    // incrementCounter();
  }
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "red",
        color: "black",
      }}
    >
      My button component
    </button>
  );
}
