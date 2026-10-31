const URL_API = "https://translate.cutie.dating";
const CLE_API = "";

const LANGUES = {
  en: "anglais",
  fr: "français",
  es: "espagnol",
  de: "allemand",
  it: "italien"
};

const listeContacts = document.querySelector("#liste-contacts");
const zoneMessages = document.querySelector("#messages");
const formulaire = document.querySelector("#formulaire-envoi");
const champTexte = document.querySelector("#texte");
const choixLangue = document.querySelector("#langue-envoi");
const boutonEnvoyer = document.querySelector("#formulaire-envoi button");
const champRecherche = document.querySelector("#recherche");
const boutonAjouter = document.querySelector("#btn-ajouter-contact");

const avatarContact = document.querySelector("#avatar-contact");
const nomContact = document.querySelector("#nom-contact");
const infoContact = document.querySelector("#info-contact");

const CLE_STOCKAGE = "monchat-contacts-v3";

let contacts = [];
let contactActif = null;

function chargerContacts() {
  const texteSauvegarde = localStorage.getItem(CLE_STOCKAGE);

  if (texteSauvegarde !== null) {
    return JSON.parse(texteSauvegarde);
  }

  return [
    {
      nom: "Sarah",
      langue: "Anglais",
      messages: [
        {
          auteur: "autre",
          texte: "Salut, ça va ?",
          original: "Hi, how are you?",
          langue: "anglais",
          heure: "14:02"
        },
        {
          auteur: "moi",
          texte: "Yes, thanks, and you?",
          original: "Oui merci et toi ?",
          langue: "anglais",
          heure: "14:03"
        }
      ]
    }
  ];
}

function sauvegarder() {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(contacts));
}

function heureActuelle() {
  const maintenant = new Date();
  return maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

async function traduireAvecLibreTranslate(texte, langueCible) {
  const reponse = await fetch(URL_API + "/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify({
      q: texte,
      source: "auto",
      target: langueCible,
      format: "text",
      api_key: CLE_API
    })
  });

  if (!reponse.ok) {
    throw new Error("Erreur " + reponse.status);
  }

  const donnees = await reponse.json();
  return donnees.translatedText;
}

async function traduireAvecMyMemory(texte, langueCible) {
  const adresse = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(texte) + "&langpair=fr|" + langueCible;
  const reponse = await fetch(adresse, { signal: AbortSignal.timeout(8000) });

  if (!reponse.ok) {
    throw new Error("Erreur " + reponse.status);
  }

  const donnees = await reponse.json();

  if (Number(donnees.responseStatus) !== 200) {
    throw new Error("Traduction refusée : choisissez une autre langue que le français");
  }

  return donnees.responseData.translatedText;
}

async function traduire(texte, langueCible) {
  try {
    const traduction = await traduireAvecLibreTranslate(texte, langueCible);
    return { texte: traduction, service: "LibreTranslate" };
  } catch (erreur) {
    console.warn("LibreTranslate indisponible, essai avec MyMemory :", erreur);
    const traduction = await traduireAvecMyMemory(texte, langueCible);
    return { texte: traduction, service: "MyMemory" };
  }
}

function afficherContacts() {
  listeContacts.textContent = "";

  contacts.forEach(function (contact) {
    const li = document.createElement("li");
    if (contact === contactActif) {
      li.classList.add("active");
    }

    const lien = document.createElement("a");
    lien.href = "#";

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = contact.nom.charAt(0).toUpperCase();

    const infos = document.createElement("div");
    infos.classList.add("infos");

    const nom = document.createElement("strong");
    nom.textContent = contact.nom;

    const dernier = document.createElement("small");
    if (contact.messages.length > 0) {
      dernier.textContent = contact.messages[contact.messages.length - 1].texte;
    } else {
      dernier.textContent = "Aucun message";
    }

    infos.append(nom, dernier);

    const meta = document.createElement("div");
    meta.classList.add("meta");

    if (contact.messages.length > 0) {
      const heure = document.createElement("time");
      heure.textContent = contact.messages[contact.messages.length - 1].heure;
      meta.append(heure);
    }

    lien.append(avatar, infos, meta);

    lien.addEventListener("click", function (event) {
      event.preventDefault();
      contactActif = contact;
      afficherContacts();
      afficherConversation();
    });

    li.append(lien);
    listeContacts.append(li);
  });
}

function creerNote(texte) {
  const note = document.createElement("p");
  note.classList.add("note");
  const petit = document.createElement("small");
  petit.textContent = texte;
  note.append(petit);
  return note;
}

function creerOriginal(texteOriginal) {
  const details = document.createElement("details");
  const resume = document.createElement("summary");
  resume.textContent = "Voir le message original";
  const paragraphe = document.createElement("p");
  paragraphe.textContent = texteOriginal;
  details.append(resume, paragraphe);
  return details;
}

function afficherConversation() {
  zoneMessages.textContent = "";

  if (contactActif === null) {
    avatarContact.textContent = "?";
    nomContact.textContent = "MonChat";
    infoContact.textContent = "Ajoutez un contact avec le bouton +";
    return;
  }

  avatarContact.textContent = contactActif.nom.charAt(0).toUpperCase();
  nomContact.textContent = contactActif.nom;
  infoContact.textContent = "Parle " + contactActif.langue.toLowerCase();

  if (contactActif.messages.length === 0) {
    const vide = document.createElement("p");
    vide.classList.add("message-vide");
    vide.textContent = "Aucun message pour le moment. Écrivez le premier !";
    zoneMessages.append(vide);
    return;
  }

  contactActif.messages.forEach(function (message) {
    const bulle = document.createElement("article");
    bulle.classList.add("message");

    if (message.auteur === "moi") {
      bulle.classList.add("envoye");
    } else {
      bulle.classList.add("recu");

      const auteur = document.createElement("p");
      auteur.classList.add("auteur");
      auteur.textContent = contactActif.nom;
      bulle.append(auteur);
    }

    const texte = document.createElement("p");
    texte.textContent = message.texte;
    bulle.append(texte);

    if (message.original) {
      if (message.auteur === "moi") {
        let note = "Traduit en " + message.langue;
        if (message.service) {
          note = note + " (" + message.service + ")";
        }
        bulle.append(creerNote(note));
      } else {
        bulle.append(creerNote("Langue d'origine : " + message.langue));
      }
      bulle.append(creerOriginal(message.original));
    } else if (message.erreur) {
      let raison = message.erreur;
      if (raison === true) {
        raison = "erreur inconnue";
      }
      bulle.append(creerNote("Traduction indisponible (" + raison + ") : message envoyé tel quel"));
    }

    const ligneHeure = document.createElement("p");
    ligneHeure.classList.add("heure");
    const heure = document.createElement("time");
    heure.textContent = message.heure;
    ligneHeure.append(heure);

    bulle.append(ligneHeure);
    zoneMessages.append(bulle);
  });

  zoneMessages.scrollTop = zoneMessages.scrollHeight;
}

boutonAjouter.addEventListener("click", function () {
  const nom = prompt("Nom du nouveau contact ?");

  if (nom === null || nom.trim() === "") {
    return;
  }

  const dejaExistant = contacts.some(function (contact) {
    return contact.nom.toLowerCase() === nom.trim().toLowerCase();
  });
  if (dejaExistant) {
    alert("Ce contact existe déjà.");
    return;
  }

  let langue = prompt("Quelle langue parle ce contact ? (ex : Anglais)", "Anglais");
  if (langue === null || langue.trim() === "") {
    langue = "Français";
  }

  const nouveauContact = {
    nom: nom.trim(),
    langue: langue.trim(),
    messages: []
  };

  contacts.push(nouveauContact);
  contactActif = nouveauContact;

  sauvegarder();
  afficherContacts();
  afficherConversation();
});

formulaire.addEventListener("submit", async function (event) {
  event.preventDefault();

  const texte = champTexte.value.trim();

  if (texte === "") {
    return;
  }
  if (contactActif === null) {
    alert("Choisissez ou ajoutez d'abord un contact.");
    return;
  }

  const langueCible = choixLangue.value;
  const message = {
    auteur: "moi",
    texte: texte,
    heure: heureActuelle()
  };

  boutonEnvoyer.disabled = true;

  try {
    const resultat = await traduire(texte, langueCible);
    message.texte = resultat.texte;
    message.service = resultat.service;
    message.original = texte;
    message.langue = LANGUES[langueCible];
  } catch (erreur) {
    console.error("Erreur de traduction :", erreur);
    if (erreur.name === "TimeoutError") {
      message.erreur = "le serveur ne répond pas (plus de 8 secondes)";
    } else if (erreur.name === "TypeError") {
      message.erreur = "connexion impossible avec le serveur";
    } else {
      message.erreur = erreur.message;
    }
  } finally {
    boutonEnvoyer.disabled = false;
  }

  contactActif.messages.push(message);

  sauvegarder();
  champTexte.value = "";
  afficherContacts();
  afficherConversation();
});

champRecherche.addEventListener("input", function () {
  const recherche = champRecherche.value.toLowerCase();

  listeContacts.querySelectorAll("li").forEach(function (li) {
    li.hidden = !li.textContent.toLowerCase().includes(recherche);
  });
});

contacts = chargerContacts();
contactActif = contacts.length > 0 ? contacts[0] : null;

afficherContacts();
afficherConversation();