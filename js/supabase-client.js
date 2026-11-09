// supabase-client.js : connexion à Supabase (comptes, salons, messages), utilisée par toutes les pages

// Adresse du projet Supabase (notre base de données en ligne)
const SUPABASE_URL = "https://oqtyizziqzrtbadthjdh.supabase.co";
// Clé publique (« publishable ») : prévue pour être visible côté navigateur, ce n'est pas un secret
const SUPABASE_CLE = "sb_publishable_pkzzGd1hmo-p7wMLaDctSQ_Tz1MuKj3";
// Client Supabase partagé par les autres scripts ; la librairie supabase-js doit être chargée avant ce fichier
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_CLE);