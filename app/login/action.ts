'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const password = formData.get('password');
  
  // On récupère le vrai mot de passe depuis les variables d'environnement
  const correctPassword = process.env.SITE_PASSWORD;

  if (password === correctPassword) {
    // Si c'est bon, on crée un cookie qui servira de "pass"
    // Note: await cookies() est requis dans les versions récentes
    (await cookies()).set('auth_token', 'autorise', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // Valable 7 jours
      path: '/',
    });
    
    redirect('/'); // On renvoie vers l'accueil
  } else {
    // Si c'est faux, on renvoie une erreur (on gérera ça dans la page)
    return { error: 'Mot de passe incorrect' };
  }
}