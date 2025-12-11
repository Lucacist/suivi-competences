// components/UploadForm.tsx
'use client'

import { useState } from 'react';
import { uploadCSV } from '@/app/actions'; // Assure-toi que ce fichier existe !
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    setStatus('loading');
    setMessage('');

    try {
      // Appel de la Server Action
      const result = await uploadCSV(formData);

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Import réussi !');
      } else {
        setStatus('error');
        setMessage(result.message || 'Une erreur est survenue.');
      }
    } catch (e) {
      setStatus('error');
      setMessage("Erreur technique lors de l'envoi.");
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
        <form action={handleSubmit} className="space-y-4">
          
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
              'Lancer l\'importation'
            )}
          </Button>

          {/* Messages de feedback */}
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