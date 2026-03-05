'use client';

import { useState } from 'react';
import { useData } from '@/lib/DataContext';
import { parseCSVFile } from '@/lib/parseCSV';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { data, importCSV } = useData();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setMessage('');

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      setStatus('error');
      setMessage('Aucun fichier sélectionné.');
      return;
    }

    try {
      const text = await file.text();
      const result = parseCSVFile(text, data.students);

      if ('error' in result) {
        setStatus('error');
        setMessage(result.error);
      } else {
        importCSV(result);
        setStatus('success');
        setMessage(`Import réussi ! ${result.students.length} nouveaux élèves, ${result.results.length} résultats.`);
        form.reset();
      }
    } catch (err) {
      console.error("Erreur lors de l'import:", err);
      setStatus('error');
      setMessage("Erreur technique lors du parsing.");
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="w-6 h-6" />
          Importer un relevé
        </CardTitle>
        <CardDescription>
          Sélectionnez le fichier CSV exporté depuis Google Sheets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid w-full items-center gap-1.5">
            <Input 
              id="csvFile" 
              name="file" 
              type="file" 
              accept=".csv" 
              required 
              disabled={status === 'loading'}
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Lancer l'importation"
            )}
          </Button>

          {status === 'success' && (
            <Alert variant="default" className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

        </form>
      </CardContent>
    </Card>
  );
}