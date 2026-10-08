import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="blueprint absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" aria-hidden />
      <div className="relative mx-auto flex max-w-3xl flex-col items-start px-4 py-28 sm:px-6">
        <p className="font-mono text-sm text-pink">404 · no router matched this host and path</p>
        <h1 className="display mt-4 text-[clamp(4rem,14vw,10rem)]">Nothing deployed here.</h1>
        <div className="mt-8 w-full rounded-2xl border border-rail bg-code p-5 font-mono text-[13px] leading-7 text-code-ink">
          <p>
            <span className="text-[#4ecdc4]">$</span> ninedeploy domains ls
          </p>
          <p className="text-white/50">→ this path isn&apos;t attached to any service</p>
          <p className="text-white/50">→ the previous page is still serving, though</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-green px-6 py-3 font-semibold text-bg">
            Go to the home page
          </Link>
          <Link href="/docs" className="rounded-full border border-rail px-6 py-3 font-semibold hover:bg-panel">
            Browse the docs
          </Link>
        </div>
      </div>
    </section>
  );
}
