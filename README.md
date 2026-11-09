# projet-fil-rouge-messagerie
# MonChat

Messagerie instantanée web avec traduction automatique des messages reçus.
Projet fil-rouge du cours Conception et programmation de sites Web.

Site en ligne : [https://evodiemelissa.github.io/projet-fil-rouge-messagerie/](https://evodiemelissa.github.io/projet-fil-rouge-messagerie/)

Description

MonChat permet de discuter en temps réel dans des salons, avec des personnes qui ne parlent pas la même langue. Chaque message reçu peut être traduit en un clic grâce à [LibreTranslate](https://libretranslate.com/), un logiciel libre. L'interface s'inspire des messageries connues : liste de salons à gauche, conversation à droite.

Public visé :des personnes qui échangent avec des proches ou des collègues dans d'autres langues.

 Fonctionnalités

 Fonctionnalités principales
- Inscription (nom, courriel, mot de passe, langue) avec vérification en direct des champs
- Connexion sécurisée par compte (Supabase Auth)
- Liste des salons : affichage, création et recherche
- Envoi et réception de messages en temps réel (Supabase Realtime)
- Messages horodatés, affichés à droite (envoyés) ou à gauche avec le nom de l'auteur (reçus)

Fonctionnalité supplémentaire : traduction automatique
- Bouton « Traduire en français » sous chaque message reçu, avec possibilité de masquer la traduction
- Service principal : LibreTranslate (logiciel libre) ; service de secours : MyMemory si le premier ne répond pas
- Le service utilisé est indiqué sous la traduction

 Autres éléments
- Pages Contact, Paramètres et Mot de passe oublié
- Mise en page adaptée aux écrans étroits (media queries)

 Technologies

| Rôle | Outil |
|---|---|
| Structure et contenu | HTML5 sémantique |
| Mise en forme | CSS (Flexbox, Grid, variables, media queries) |
| Logique | JavaScript (DOM, événements, fetch, async/await) |
| Comptes, salons, messages | [Supabase](https://supabase.com/) (authentification, base de données, temps réel) |
| Traduction | [LibreTranslate](https://libretranslate.com/) et MyMemory (secours) |
| Icônes et police | Font Awesome, Google Fonts (Poppins) |
| Publication | GitHub Pages |

 Organisation du projet


projet-fil-rouge-messagerie/
├── index.html                       Page de connexion (accueil)
├── README.md
├── css/
│   ├── base.css                     Styles communs (palette, en-tête, carte)
│   ├── accueil.css                  Page de connexion
│   └── conversation.css             Page de conversation
├── js/
│   ├── supabase-client.js           Connexion à Supabase
│   ├── connexion.js                 Formulaire de connexion
│   ├── inscription.js               Envoi du formulaire d'inscription
│   ├── validation-inscription.js    Vérification en direct (courriel, mots de passe)
│   └── conversation.js              Salons, messages, temps réel, traduction
└── pages/
    ├── inscription.html
    ├── conversation.html
    ├── parametres.html
    ├── contact.html
    └── mot-de-passe-oublie.html


*Conventions de nommage :* noms de fichiers en minuscules, sans accents ni espaces, mots séparés par des tirets ; un dossier par type de fichier (css/, js/, pages/) ; code commenté en français ; messages de commit courts qui disent ce qui a été fait.

## Utiliser le projet

En ligne :ouvrir le lien du site en haut de cette page, créer un compte, puis rejoindre ou créer un salon.

*En local :
1. Cloner le dépôt : git clone https://github.com/Evodiemelissa/projet-fil-rouge-messagerie.git
2. Ouvrir le dossier dans VS Code
3. Lancer index.html avec l'extension Live Server

 Équipe

| Personne | Rôle |

| Evodie melissa GASPARD | Mise en forme (HTML/CSS), organisation et nomenclature des fichiers, commentaires du code, interface de conversation |
| Hassane TRAORE | Intégration Supabase : comptes, connexion, salons, messages en temps réel |

 Limites connues

- La page Paramètres n'enregistre pas encore les préférences.
- Le lien « Mot de passe oublié » n'envoie pas encore de courriel.
- La traduction dépend de la disponibilité des services externes.

 Licence et crédits

Messages traduits avec LibreTranslate, un logiciel libre. Projet réalisé dans le cadre du cours 8WEB101.
