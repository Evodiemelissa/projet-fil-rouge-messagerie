// ---------- Traduction (inchangée, réutilisée plus tard) ----------
const URL_API = "https://translate.cutie.dating";
const CLE_API = "";

const LANGUES = {
  en: "anglais",
  fr: "français",
  es: "espagnol",
  de: "allemand",
  it: "italien"
};

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

// ---------- Éléments de la page ----------
const listeSalons = document.querySelector("#liste-contacts");
const zoneMessages = document.querySelector("#messages");
const formulaire = document.querySelector("#formulaire-envoi");
const champTexte = document.querySelector("#texte");
const boutonEnvoyer = document.querySelector("#formulaire-envoi button");
const champRecherche = document.querySelector("#recherche");
const boutonAjouter = document.querySelector("#btn-ajouter-contact");

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
async function verifierConnexion() {
  const { data } = await sb.auth.getSession();

  if (!data.session) {
    window.location.href = "../index.html";
    return null;
  }
  return data.session.user;
}

// ---------- Salons ----------
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

    lien.addEventListener("click", function (event) {
      event.preventDefault();
      choisirSalon(salon);
    });

    li.append(lien);
    listeSalons.append(li);
  });
}

async function choisirSalon(salon) {
  salonActif = salon;
  afficherSalons();
  afficherEnteteSalon();
  await chargerMessages();
  abonnerAuxMessages();
}

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
function formaterHeure(dateTexte) {
  return new Date(dateTexte).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function creerBoutonTraduire(texteOriginal) {
  const conteneur = document.createElement("div");

  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.classList.add("bouton-traduire");
  bouton.textContent = "Traduire en français";

  const resultat = document.createElement("p");
  resultat.classList.add("traduction");
  resultat.hidden = true;

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
function creerBulle(message) {
  const bulle = document.createElement("article");
  bulle.classList.add("message");
  bulle.dataset.id = message.id;

  if (message.user_id === utilisateur.id) {
    bulle.classList.add("envoye");
  } else {
    bulle.classList.add("recu");

    const auteur = document.createElement("p");
    auteur.classList.add("auteur");
    auteur.textContent = message.username;
    bulle.append(auteur);
  }

  const texte = document.createElement("p");
  texte.textContent = message.content;
  bulle.append(texte);
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
function abonnerAuxMessages() {
  if (canalMessages !== null) {
    sb.removeChannel(canalMessages);
    canalMessages = null;
  }

  if (salonActif === null) {
    return;
  }

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
champRecherche.addEventListener("input", function () {
  const recherche = champRecherche.value.toLowerCase();

  listeSalons.querySelectorAll("li").forEach(function (li) {
    li.hidden = !li.textContent.toLowerCase().includes(recherche);
  });
});

boutonAjouter.addEventListener("click", creerSalon);

// ---------- Démarrage ----------
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

demarrer();