import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Magic Party</h1>
      <Link href="/game" className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold">
        Start Game
      </Link>
    </main>
  );
}
