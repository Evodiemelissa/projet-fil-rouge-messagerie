// conversation.js : page de conversation (salons, messages en temps réel, traduction avec LibreTranslate)

// ---------- Traduction (inchangée, réutilisée plus tard) ----------
// Adresse du serveur LibreTranslate (service de traduction libre)
const URL_API = "https://translate.cutie.dating";
// Clé d'API : vide, car ce serveur n'en demande pas
const CLE_API = "";

// Codes de langue (envoyés à l'API) -> noms en français
const LANGUES = {
  en: "anglais",
  fr: "français",
  es: "espagnol",
  de: "allemand",
  it: "italien"
};

// Traduction principale : envoie le texte à LibreTranslate (abandon après 5 secondes)
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

// Traduction de secours : service MyMemory (abandon après 8 secondes)
async function traduireAvecMyMemory(texte, langueCible) {
  const adresse = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(texte) + "&langpair=Autodetect|" + langueCible;
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

// Essaie LibreTranslate, puis MyMemory si le premier ne répond pas
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

// ---------- Éléments de la page ----------
// On récupère les éléments HTML dont on a besoin grâce à leur id
const listeSalons = document.querySelector("#liste-contacts");
const zoneMessages = document.querySelector("#messages");
const formulaire = document.querySelector("#formulaire-envoi");
const champTexte = document.querySelector("#texte");
const boutonEnvoyer = document.querySelector("#formulaire-envoi button");
const champRecherche = document.querySelector("#recherche");
const boutonAjouter = document.querySelector("#btn-ajouter-contact");

// Éléments de l'en-tête de la conversation (initiale, nom, information)
const avatarSalon = document.querySelector("#avatar-contact");
const nomSalon = document.querySelector("#nom-contact");
const infoSalon = document.querySelector("#info-contact");

// ---------- État ----------
let utilisateur = null;       // la personne connectée
let nomUtilisateur = "";      // nom affiché dans ses messages
let salons = [];              // salons venant de Supabase
let salonActif = null;
let canalMessages = null;     // abonnement temps réel au salon ouvert

// ---------- Connexion ----------
// Vérifie qu'une personne est connectée à Supabase ; sinon renvoie vers la page d'accueil
async function verifierConnexion() {
  const { data } = await sb.auth.getSession();

  if (!data.session) {
    // Pas de session : retour à la connexion (../ car on est dans le dossier pages)
    window.location.href = "../index.html";
    return null;
  }
  return data.session.user;
}

// ---------- Salons ----------
// Charge les salons depuis la table « channels » de Supabase, triés par nom
async function chargerSalons() {
  const { data, error } = await sb
    .from("channels")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erreur salons :", error.message);
    alert("Impossible de charger les salons : " + error.message);
    return;
  }
  salons = data;
}

// Affiche la liste des salons dans la colonne de gauche
function afficherSalons() {
  listeSalons.textContent = "";

  salons.forEach(function (salon) {
    const li = document.createElement("li");
    if (salonActif !== null && salon.id === salonActif.id) {
      li.classList.add("active");
    }

    const lien = document.createElement("a");
    lien.href = "#";

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = salon.name.charAt(0).toUpperCase();

    const infos = document.createElement("div");
    infos.classList.add("infos");

    const nom = document.createElement("strong");
    nom.textContent = salon.name;

    infos.append(nom);
    lien.append(avatar, infos);

    // Au clic sur un salon, on l'ouvre (preventDefault évite de suivre le lien #)
    lien.addEventListener("click", function (event) {
      event.preventDefault();
      choisirSalon(salon);
    });

    li.append(lien);
    listeSalons.append(li);
  });
}

// Ouvre un salon : met à jour l'affichage, charge ses messages et écoute les nouveaux
async function choisirSalon(salon) {
  salonActif = salon;
  afficherSalons();
  afficherEnteteSalon();
  await chargerMessages();
  abonnerAuxMessages();
}

// Affiche le nom et l'initiale du salon ouvert dans l'en-tête de droite
function afficherEnteteSalon() {
  if (salonActif === null) {
    avatarSalon.textContent = "?";
    nomSalon.textContent = "MonChat";
    infoSalon.textContent = "Créez un salon avec le bouton +";
    return;
  }

  avatarSalon.textContent = salonActif.name.charAt(0).toUpperCase();
  nomSalon.textContent = salonActif.name;
  infoSalon.textContent = "Salon";
}

// Crée un nouveau salon dans Supabase (le nom est demandé avec prompt)
async function creerSalon() {
  const nom = prompt("Nom du nouveau salon ?");

  if (nom === null || nom.trim() === "") {
    return;
  }

  const { data, error } = await sb
    .from("channels")
    .insert({ name: nom.trim() })
    .select()
    .single();

  if (error) {
    alert("Impossible de créer le salon : " + error.message);
    return;
  }

  await chargerSalons();
  await choisirSalon(data);
}

// ---------- Messages ----------
// Transforme une date de Supabase en heure lisible (HH:MM)
function formaterHeure(dateTexte) {
  return new Date(dateTexte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
// Crée le bouton « Traduire en français » placé sous les messages reçus
function creerBoutonTraduire(texteOriginal) {
  const conteneur = document.createElement("div");

  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.classList.add("bouton-traduire");
  bouton.textContent = "Traduire en français";

  const resultat = document.createElement("p");
  resultat.classList.add("traduction");
  resultat.hidden = true;

  // Sert à ne traduire qu'une fois, puis à afficher ou cacher le résultat
  let dejaTraduit = false;

  bouton.addEventListener("click", async function () {
    // Déjà traduit : on affiche ou cache simplement le résultat
    if (dejaTraduit) {
      resultat.hidden = !resultat.hidden;
      bouton.textContent = resultat.hidden ? "Traduire en français" : "Masquer la traduction";
      return;
    }

    bouton.disabled = true;
    bouton.textContent = "Traduction…";

    try {
      const reponse = await traduire(texteOriginal, "fr");
      resultat.textContent = reponse.texte + " (" + reponse.service + ")";
      dejaTraduit = true;
      bouton.textContent = "Masquer la traduction";
    } catch (erreur) {
      console.error("Erreur de traduction :", erreur);
      resultat.textContent = "Traduction indisponible pour le moment.";
      bouton.textContent = "Réessayer la traduction";
    } finally {
      resultat.hidden = false;
      bouton.disabled = false;
    }
  });

  conteneur.append(bouton, resultat);
  return conteneur;
}
// Construit la bulle HTML d'un message (envoyé ou reçu)
function creerBulle(message) {
  const bulle = document.createElement("article");
  bulle.classList.add("message");
  // L'id du message est gardé dans la bulle pour éviter les doublons
  bulle.dataset.id = message.id;

  // Mes messages à droite (envoye), ceux des autres à gauche (recu) avec le nom de l'auteur
  if (message.user_id === utilisateur.id) {
    bulle.classList.add("envoye");
  } else {
    bulle.classList.add("recu");

    const auteur = document.createElement("p");
    auteur.classList.add("auteur");
    auteur.textContent = message.username;
    bulle.append(auteur);
  }

  // textContent (et non innerHTML) : le texte est affiché tel quel, ce qui évite les failles XSS
  const texte = document.createElement("p");
  texte.textContent = message.content;
  bulle.append(texte);
    // Le bouton de traduction n'apparaît que sur les messages des autres
    if (message.user_id !== utilisateur.id) {
    bulle.append(creerBoutonTraduire(message.content));
  }
  const ligneHeure = document.createElement("p");
  ligneHeure.classList.add("heure");
  const heure = document.createElement("time");
  heure.textContent = formaterHeure(message.created_at);
  ligneHeure.append(heure);
  bulle.append(ligneHeure);

  return bulle;
}

// Ajoute un message à l'écran (sans doublon) et fait défiler vers le bas
function ajouterMessage(message) {
  // évite les doublons (envoi + temps réel)
  if (zoneMessages.querySelector('[data-id="' + message.id + '"]')) {
    return;
  }

  const vide = zoneMessages.querySelector(".message-vide");
  if (vide) {
    vide.remove();
  }

  zoneMessages.append(creerBulle(message));
  zoneMessages.scrollTop = zoneMessages.scrollHeight;
}

// Charge les messages du salon ouvert depuis la table « messages », du plus ancien au plus récent
async function chargerMessages() {
  zoneMessages.textContent = "";

  if (salonActif === null) {
    return;
  }

  const { data, error } = await sb
    .from("messages")
    .select("*")
    .eq("channel_id", salonActif.id)
    .order("created_at");

  if (error) {
    console.error("Erreur messages :", error.message);
    alert("Impossible de charger les messages : " + error.message);
    return;
  }

  if (data.length === 0) {
    const vide = document.createElement("p");
    vide.classList.add("message-vide");
    vide.textContent = "Aucun message pour le moment. Écrivez le premier !";
    zoneMessages.append(vide);
    return;
  }

  data.forEach(ajouterMessage);
}

// ---------- Temps réel ----------
// Écoute en temps réel les nouveaux messages du salon ouvert (Supabase Realtime)
function abonnerAuxMessages() {
  if (canalMessages !== null) {
    sb.removeChannel(canalMessages);
    canalMessages = null;
  }

  if (salonActif === null) {
    return;
  }

  // Chaque nouveau message inséré dans ce salon est ajouté à l'écran
  canalMessages = sb
    .channel("messages-" + salonActif.id)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: "channel_id=eq." + salonActif.id
      },
      function (payload) {
        ajouterMessage(payload.new);
      }
    )
    .subscribe();
}

// ---------- Envoi ----------
// Envoi d'un message : on l'enregistre dans Supabase, puis on l'affiche
formulaire.addEventListener("submit", async function (event) {
  event.preventDefault();

  const texte = champTexte.value.trim();

  if (texte === "") {
    return;
  }
  if (salonActif === null) {
    alert("Choisissez ou créez d'abord un salon.");
    return;
  }

  boutonEnvoyer.disabled = true;

  const { data, error } = await sb
    .from("messages")
    .insert({
      channel_id: salonActif.id,
      username: nomUtilisateur,
      content: texte
    })
    .select()
    .single();

  boutonEnvoyer.disabled = false;

  if (error) {
    alert("Message non envoyé : " + error.message);
    return;
  }

  champTexte.value = "";
  ajouterMessage(data);
});

// ---------- Recherche ----------
// Recherche : cache les salons dont le nom ne contient pas le texte saisi
champRecherche.addEventListener("input", function () {
  const recherche = champRecherche.value.toLowerCase();

  listeSalons.querySelectorAll("li").forEach(function (li) {
    li.hidden = !li.textContent.toLowerCase().includes(recherche);
  });
});

// Le bouton + crée un nouveau salon
boutonAjouter.addEventListener("click", creerSalon);

// ---------- Démarrage ----------
// Lancement de la page : vérifie la connexion, charge les salons et ouvre le premier
async function demarrer() {
  utilisateur = await verifierConnexion();
  if (utilisateur === null) {
    return;
  }

  const meta = utilisateur.user_metadata || {};
  nomUtilisateur = meta.nom || utilisateur.email;

  await chargerSalons();
  afficherSalons();

  if (salons.length > 0) {
    await choisirSalon(salons[0]);
  } else {
    afficherEnteteSalon();
  }
}

// On lance le programme
demarrer();