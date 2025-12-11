// app/page.tsx
import UploadForm from '@/components/UploadForm';

export default function Home() {
  return (
    <main className="flex h-[calc(100vh_-_61px_-_24px)] flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          Suivi des Compétences
        </h1>
      </div>

      <UploadForm />

      <div className="mt-12 text-center text-slate-500">
        <p>Système connecté à la base de données locale.</p>
      </div>
    </main>
  );
}