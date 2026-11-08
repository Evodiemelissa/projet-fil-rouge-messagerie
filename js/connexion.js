// connexion.js : gère le formulaire de connexion de la page d'accueil (index.html)

// Éléments de la page : le formulaire et le paragraphe où s'affichent les erreurs
const formulaire = document.querySelector("#formulaire-connexion");
const erreur = document.querySelector("#erreur-connexion");

// Quand la personne clique sur « Se connecter »
formulaire.addEventListener("submit", async function (event) {
  event.preventDefault(); // empêche le rechargement de la page
  erreur.textContent = ""; // efface l'ancien message d'erreur

  // Lecture des champs saisis (trim() enlève les espaces au début et à la fin)
  const courriel = document.querySelector("#courriel").value.trim();
  const motDePasse = document.querySelector("#mot-de-passe").value;

  // Demande de connexion à Supabase avec le courriel et le mot de passe
  const { error } = await sb.auth.signInWithPassword({
    email: courriel,
    password: motDePasse,
  });

  // Si la connexion échoue : on affiche le message d'erreur et on s'arrête
  if (error) {
    erreur.textContent = "Connexion impossible : " + error.message;
    return;
  }

  // Connexion réussie : on ouvre la page de conversation
  window.location.href = "pages/conversation.html";
});