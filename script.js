const courriel = document.querySelector("#courriel");
const courrielMessage = document.querySelector("#courriel-message");

function validerCourriel(valeur) {
  // split("@") coupe le texte à chaque @ et en fait une liste
  const morceaux = valeur.split("@");

  // Il doit y avoir exactement 2 morceaux (donc un seul @)
  if (morceaux.length !== 2) {
    return false;
  }

  const nom = morceaux[0];      // ce qui est avant le @
  const domaine = morceaux[1];  // ce qui est après le @

  const nomPresent = nom !== "";
  const domaineAUnPoint = domaine.includes(".");
  const pointAuDebut = domaine.startsWith(".");
  const pointALaFin = domaine.endsWith(".");
  const aDesEspaces = valeur.includes(" ");

  return nomPresent && domaineAUnPoint && !pointAuDebut && !pointALaFin && !aDesEspaces;
}

courriel.addEventListener("input", function (event) {
  const valeur = event.target.value;

  if (valeur === "") {
    courrielMessage.textContent = "Le courriel est obligatoire.";
  } else if (validerCourriel(valeur)) {
    courrielMessage.textContent = "Le courriel semble valide.";
  } else {
    courrielMessage.textContent = "Le courriel n'est pas valide (exemple : alice@exemple.com).";
  }
})
const mdp = document.querySelector("#mdp");
const mdpMessage = document.querySelector("#mdp-message");
const mdpConfirm = document.querySelector("#mdp-confirm");
const mdpConfirmMessage = document.querySelector("#mdp-confirm-message");

function verifierMotDePasse() {
  const valeur = mdp.value;

  if (valeur === "") {
    mdpMessage.textContent = "Le mot de passe est obligatoire.";
  } else if (valeur.length < 8) {
    mdpMessage.textContent = "Il manque des caractères : " + valeur.length + " sur 8 minimum.";
  } else {
    mdpMessage.textContent = "Mot de passe assez long.";
  }
}

function verifierConfirmation() {
  if (mdpConfirm.value === "") {
    mdpConfirmMessage.textContent = "Veuillez confirmer le mot de passe.";
  } else if (mdpConfirm.value !== mdp.value) {
    mdpConfirmMessage.textContent = "Les deux mots de passe sont différents.";
  } else {
    mdpConfirmMessage.textContent = "Les mots de passe sont identiques.";
  }
}

mdp.addEventListener("input", function () {
  verifierMotDePasse();
  verifierConfirmation(); // on revérifie aussi la confirmation
});

mdpConfirm.addEventListener("input", verifierConfirmation);