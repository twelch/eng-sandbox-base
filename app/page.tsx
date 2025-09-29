import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] relative">
      {/* Admin Panel button in top right */}
      <Link href="/admin" className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <button
          className="px-4 py-2 bg-transparent text-gray-600 border border-gray-400 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-colors duration-200 text-sm"
        >
          Admin Panel
        </button>
      </Link>
      
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/assessment">
            <button
              className="px-6 py-3 bg-green-400 text-white rounded-lg shadow hover:bg-green-500 transition-colors duration-200"
            >
              Start Assessment
            </button>
          </Link>
        </div>
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
