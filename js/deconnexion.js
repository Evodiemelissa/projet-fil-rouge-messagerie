// deconnexion.js : ferme la session Supabase quand on clique sur « Se déconnecter »
document.querySelectorAll(".lien-deconnexion").forEach(function (lien) {
  lien.addEventListener("click", async function (event) {
    event.preventDefault();
    await sb.auth.signOut();
    window.location.href = "../index.html";
  });
});