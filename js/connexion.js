const formulaire = document.querySelector("#formulaire-connexion");
const erreur = document.querySelector("#erreur-connexion");

formulaire.addEventListener("submit", async function (event) {
  event.preventDefault();
  erreur.textContent = "";

  const courriel = document.querySelector("#courriel").value.trim();
  const motDePasse = document.querySelector("#mot-de-passe").value;

  const { error } = await sb.auth.signInWithPassword({
    email: courriel,
    password: motDePasse,
  });

  if (error) {
    erreur.textContent = "Connexion impossible : " + error.message;
    return;
  }

  window.location.href = "pages/conversation.html";
});