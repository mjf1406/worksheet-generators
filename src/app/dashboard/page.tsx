import Sidebar from "~/components/navigation/Sidebar";

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <main className="flex min-h-screen flex-col items-center justify-center gap-32 bg-background p-5 text-foreground">
        <h1 className="text-5xl">Home</h1>
      </main>
    </>
  );
}
