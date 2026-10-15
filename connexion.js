// ---------- Outil : afficher un message coloré ----------
function afficherMessage(element, texte, estValide) {
  element.textContent = texte;

  if (estValide) {
    element.classList.add("message-ok");
    element.classList.remove("message-erreur");
  } else {
    element.classList.add("message-erreur");
    element.classList.remove("message-ok");
  }
}

// ---------- Courriel ----------
const courriel = document.querySelector("#courriel");
const courrielMessage = document.querySelector("#courriel-message");

function validerCourriel(valeur) {
  const morceaux = valeur.split("@");

  if (morceaux.length !== 2) {
    return false;
  }

  const nom = morceaux[0];
  const domaine = morceaux[1];

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
    afficherMessage(courrielMessage, "Le courriel est obligatoire.", false);
  } else if (validerCourriel(valeur)) {
    afficherMessage(courrielMessage, "Le courriel semble valide.", true);
  } else {
    afficherMessage(courrielMessage, "Le courriel n'est pas valide (exemple : alice@exemple.com).", false);
  }
});

// ---------- Mot de passe ----------
const mdp = document.querySelector("#mdp");
const mdpMessage = document.querySelector("#mdp-message");

mdp.addEventListener("input", function (event) {
  const valeur = event.target.value;

  if (valeur === "") {
    afficherMessage(mdpMessage, "Le mot de passe est obligatoire.", false);
  } else {
    afficherMessage(mdpMessage, "", true);
  }
});