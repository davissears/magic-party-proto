export default function Button() {
  async function onClick() {
    "use server";
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
