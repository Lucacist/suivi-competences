'use client';

import { loginAction } from './action';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Lock } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
    >
      {pending ? 'Vérification...' : 'Accéder au site'}
    </button>
  );
}

export default function LoginPage() {
  // Un petit state pour afficher l'erreur si besoin
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    const result = await loginAction(formData);
    if (result?.error) {
      setErrorMessage(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Accès Restreint</h1>
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Entrez le mot de passe..."
            />
          </div>
          
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}