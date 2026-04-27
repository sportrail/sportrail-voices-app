export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
      <header className="mb-10">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-sr-red">
          Sportrail · Interno
        </p>
        <h1 className="mt-3 font-bebas text-5xl leading-none tracking-wide text-sr-black md:text-6xl">
          Gerador de Posts — Campanha 10 Anos
        </h1>
        <p className="mt-4 max-w-2xl text-base text-sr-grey-dim md:text-lg">
          Preenche os dados do testemunho, escolhe a foto, e em 25 segundos tens
          os 4 posts prontos para publicar.
        </p>
      </header>

      <section className="rounded-sr bg-sr-black p-8 text-sr-cream shadow-lg md:p-10">
        <p className="text-sr-grey">Formulário em construção (Fase 2).</p>
      </section>
    </main>
  );
}
