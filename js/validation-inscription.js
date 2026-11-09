// validation-inscription.js : vérifie en direct le courriel et les mots de passe de la page d'inscription

// ---------- Outil : afficher un message coloré ----------
// Écrit le texte dans l'élément, en vert si c'est valide et en rouge sinon
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

// Renvoie true si le courriel a la forme nom@domaine.ext (sans espaces)
function validerCourriel(valeur) {
  // On coupe le texte en deux morceaux autour du @
  const morceaux = valeur.split("@");

  // Il doit y avoir exactement un @
  if (morceaux.length !== 2) {
    return false;
  }

  const nom = morceaux[0];
  const domaine = morceaux[1];

  // Les différentes vérifications, chacune donne vrai ou faux
  const nomPresent = nom !== "";
  const domaineAUnPoint = domaine.includes(".");
  const pointAuDebut = domaine.startsWith(".");
  const pointALaFin = domaine.endsWith(".");
  const aDesEspaces = valeur.includes(" ");

  // Tout doit être correct en même temps
  return nomPresent && domaineAUnPoint && !pointAuDebut && !pointALaFin && !aDesEspaces;
}

// À chaque lettre tapée, on affiche un message vert ou rouge
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
const mdpConfirm = document.querySelector("#mdp-confirm");
const mdpConfirmMessage = document.querySelector("#mdp-confirm-message");

// Vérifie la longueur du mot de passe (8 caractères minimum)
function verifierMotDePasse() {
  const valeur = mdp.value;

  if (valeur === "") {
    afficherMessage(mdpMessage, "Le mot de passe est obligatoire.", false);
  } else if (valeur.length < 8) {
    afficherMessage(mdpMessage, "Il manque des caractères : " + valeur.length + " sur 8 minimum.", false);
  } else {
    afficherMessage(mdpMessage, "Mot de passe assez long.", true);
  }
}

// Vérifie que la confirmation est identique au mot de passe
function verifierConfirmation() {
  if (mdpConfirm.value === "") {
    afficherMessage(mdpConfirmMessage, "Veuillez confirmer le mot de passe.", false);
  } else if (mdpConfirm.value !== mdp.value) {
    afficherMessage(mdpConfirmMessage, "Les deux mots de passe sont différents.", false);
  } else {
    afficherMessage(mdpConfirmMessage, "Les mots de passe sont identiques.", true);
  }
}

// Quand le mot de passe change, on revérifie aussi la confirmation
mdp.addEventListener("input", function () {
  verifierMotDePasse();
  verifierConfirmation();
});

// Quand la confirmation change, on la revérifie
mdpConfirm.addEventListener("input", verifierConfirmation);