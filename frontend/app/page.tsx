export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Kolozus v3</h1>
        <p className="text-muted-foreground mt-4">Frontend rebooted successfully.</p>
      </div>
      <div className="mt-8 grid gap-4">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h2 className="text-xl font-semibold">System Ready</h2>
          <p className="text-sm text-muted-foreground">Tailwind + Shadcn/UI Configured.</p>
        </div>
      </div>
    </main>
  );
}
