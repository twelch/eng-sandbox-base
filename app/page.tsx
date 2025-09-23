import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-center text-4xl">Small Forest Landowner Resources</h1>
        <p className="max-w-xl text-center">Assess your forestland. Learn about available incentives and measure carbon and water quality potential. </p>
        <Link href="/assessment">
          <button
            className="px-6 py-3 bg-green-400 text-white rounded-lg shadow hover:bg-green-500 transition-colors duration-200"
          >
            Start Assessment
          </button>
        </Link>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Image
          src="/af-logo.png"
          alt="AF Logo"
          width={300}
          height={100}
          priority
        />
        
      </footer>
    </div>
  );
}
