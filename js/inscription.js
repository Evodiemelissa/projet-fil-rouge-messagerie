// inscription.js : envoie le formulaire d'inscription à Supabase
// (la vérification en direct du courriel et des mots de passe est dans validation-inscription.js)

// Éléments de la page : le formulaire et le paragraphe où s'affichent les erreurs
const formulaire = document.querySelector("#formulaire-inscription");
const erreur = document.querySelector("#erreur-inscription");

// Quand la personne clique sur « S'inscrire »
formulaire.addEventListener("submit", async function (event) {
  event.preventDefault();               // empêche le rechargement de la page
  erreur.textContent = "";              // efface l'ancien message d'erreur

  // Lecture des champs saisis
  const nom = document.querySelector("#nom").value.trim();
  const courriel = document.querySelector("#courriel").value.trim();
  const mdp = document.querySelector("#mdp").value;
  const mdpConfirm = document.querySelector("#mdp-confirm").value;
  const langue = document.querySelector("#langue").value;

  // Les deux mots de passe doivent être identiques
  if (mdp !== mdpConfirm) {
    erreur.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  // Création du compte dans Supabase ; le nom et la langue sont gardés avec le compte
  const { data, error } = await sb.auth.signUp({
    email: courriel,
    password: mdp,
    options: { data: { nom: nom, langue: langue } }   // infos gardées avec le compte
  });

  // Si la création échoue (courriel déjà utilisé, etc.) : on affiche l'erreur et on s'arrête
  if (error) {
    erreur.textContent = error.message;
    return;
  }

  // Inscription réussie : on ouvre la page de conversation
  window.location.href = "conversation.html";
});