// La homepage est maintenant servie par (site)/page.tsx
// Ce fichier redirige vers le dashboard si l'utilisateur est connecté
// Sinon, Next.js sert le layout (site) qui affiche la homepage publique
export { default } from "./(site)/page";
