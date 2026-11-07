const formulaire = document.querySelector("#formulaire-inscription");
const erreur = document.querySelector("#erreur-inscription");

formulaire.addEventListener("submit", async function (event) {
  event.preventDefault();               // empêche le rechargement de la page
  erreur.textContent = "";

  const nom = document.querySelector("#nom").value.trim();
  const courriel = document.querySelector("#courriel").value.trim();
  const mdp = document.querySelector("#mdp").value;
  const mdpConfirm = document.querySelector("#mdp-confirm").value;
  const langue = document.querySelector("#langue").value;

  if (mdp !== mdpConfirm) {
    erreur.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  const { data, error } = await sb.auth.signUp({
    email: courriel,
    password: mdp,
    options: { data: { nom: nom, langue: langue } }   // infos gardées avec le compte
  });

  if (error) {
    erreur.textContent = error.message;
    return;
  }

  window.location.href = "conversation.html";
});