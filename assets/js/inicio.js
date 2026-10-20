// Roda antes de a página aparecer.
// "anima": esconde o que vai entrar animado. "intro": mostra a abertura com a flor,
// só na primeira página vista na visita. Quem pediu menos movimento no celular
// vê tudo parado, sem abertura.
(function () {
  var raiz = document.documentElement;
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  raiz.classList.add('anima');
  var vista = false;
  try { vista = sessionStorage.getItem('serena-abertura') === '1'; } catch (e) { /* aba anônima */ }
  if (!vista) raiz.classList.add('intro');
  // Se o script do site não carregar, mostra tudo assim mesmo.
  setTimeout(function () {
    if (!window.serenaPronto) raiz.classList.remove('anima', 'intro');
  }, 3500);
})();
