/* Espaço Serena: o que se mexe no site.
   1. Painel "aberto agora" (funciona mesmo sem animação).
   2. Abertura: a flor se desenha no meio da tela, o nome aparece, a cortina sobe e a
      flor desliza pro lugar dela, na frente do SERENA gigante. Uma vez por visita;
      nas outras páginas a flor se desenha no lugar, mais rápido. Toque pula.
   3. Rolagem: o nome gigante sobe mais devagar que a flor (profundidade) e a linha
      dourada liga os três passos de "Como agendar". */
(function () {
  var raiz = document.documentElement;

  // ---------------------------------------------------------------- aberto agora
  // Horário da agenda online, em minutos desde a meia-noite. 0 = domingo.
  var HORARIO = {
    2: [[480, 720], [780, 1020]],
    3: [[480, 720], [780, 1020]],
    4: [[480, 720], [780, 1020]],
    5: [[480, 720], [780, 1020]],
    6: [[480, 720]]
  };
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function hora(min) { return min === 720 ? 'meio-dia' : (min / 60) + 'h'; }

  function agoraEmCampinas() {
    var p = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return {
      dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday),
      min: Number(p.hour) * 60 + Number(p.minute)
    };
  }

  function situacao() {
    var a = agoraEmCampinas();
    var faixas = HORARIO[a.dia] || [];
    for (var i = 0; i < faixas.length; i++) {
      var f = faixas[i];
      if (a.min >= f[0] && a.min < f[1]) return ['Aberto agora', 'até ' + (f[1] === 720 ? 'o meio-dia' : hora(f[1]))];
      if (a.min < f[0]) return i === 0 ? ['Fechado agora', 'abre hoje às ' + hora(f[0])] : ['Pausa pro almoço', 'volta às ' + hora(f[0])];
    }
    for (var d = 1; d <= 7; d++) {
      var dia = (a.dia + d) % 7;
      if (HORARIO[dia]) return ['Fechado agora', 'abre ' + (d === 1 ? 'amanhã' : DIAS[dia]) + ' às ' + hora(HORARIO[dia][0][0])];
    }
  }

  var painel = document.querySelector('[data-agora]');
  if (painel && window.Intl) {
    try {
      var s = situacao();
      painel.querySelector('.painel-rotulo b').textContent = s[0];
      painel.querySelector('.painel-rotulo span').textContent = s[1];
      painel.classList.toggle('aberto', s[0] === 'Aberto agora');
    } catch (erro) { /* fica o horário escrito no HTML */ }
  }

  // ---------------------------------------------------------------- animação
  if (!raiz.classList.contains('anima')) return;
  var M = window.Motion;
  if (!M) { raiz.classList.remove('anima', 'intro'); return; }
  window.serenaPronto = true;

  var suave = [0.22, 1, 0.36, 1];
  var caneta = [0.65, 0, 0.35, 1];
  var controles = [];
  function anima(alvo, valores, opcoes) {
    var c = M.animate(alvo, valores, opcoes);
    controles.push(c);
    return c;
  }

  var flor = document.querySelector('.flor');
  var cortina = document.querySelector('.cortina');
  function tracos(ordem) { return flor.querySelectorAll('.flor-tracos path[data-ordem="' + ordem + '"]'); }

  // A flor se desenha como uma caneta: caule, taça, pétalas, o V e por fim a ponta.
  // Devolve o momento (em segundos) em que ela fica completa.
  function desenhaFlor(t0, ritmo) {
    anima(tracos(1), { strokeDashoffset: [1, 0] }, { duration: 0.5 * ritmo, delay: t0, ease: caneta });
    anima(tracos(2), { strokeDashoffset: [1, 0] }, { duration: 1.1 * ritmo, delay: t0 + 0.35 * ritmo, ease: caneta });
    anima(tracos(3), { strokeDashoffset: [1, 0] }, { duration: 1.0 * ritmo, delay: t0 + 0.8 * ritmo, ease: caneta });
    anima(tracos(4), { strokeDashoffset: [1, 0] }, { duration: 0.7 * ritmo, delay: t0 + 1.3 * ritmo, ease: caneta });
    anima(tracos(5), { strokeDashoffset: [1, 0] }, { duration: 0.8 * ritmo, delay: t0 + 1.5 * ritmo, ease: caneta });
    var pronta = t0 + 2.3 * ritmo;
    // um brilho dourado atravessa a flor quando ela fecha
    anima('.flor-brilho', { transform: ['translateX(-90px)', 'translateX(250px)'] }, { duration: 1.2, delay: pronta - 0.1, ease: [0.4, 0, 0.2, 1] });
    return pronta;
  }

  function revelaPalco(t) {
    anima('.gigante i', { transform: ['translateY(105%)', 'translateY(0%)'] }, { duration: 1.1, delay: M.stagger(0.07, { startDelay: t }), ease: suave });
    anima('.palco-titulo', { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, { duration: 0.9, delay: t + 0.3, ease: suave });
    anima('.paineis > *', { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] }, { duration: 0.9, delay: M.stagger(0.09, { startDelay: t + 0.5 }), ease: suave });
    anima('.whats', { opacity: [0, 1], transform: ['scale(0.6)', 'scale(1)'] }, { duration: 0.6, delay: t + 1.1, ease: suave });
  }

  var terminou = false;
  function fim() {
    if (terminou) return;
    terminou = true;
    flor.style.transform = '';
    flor.classList.remove('flor-no-centro');
    raiz.classList.remove('intro');
  }

  if (raiz.classList.contains('intro')) {
    try { sessionStorage.setItem('serena-abertura', '1'); } catch (e) { /* aba anônima */ }

    // calcula onde a flor fica no meio da tela, maior, e começa dali
    var r = flor.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var escala = Math.min(vw * 0.56, 300) / r.width;
    var dx = vw / 2 - (r.left + r.width / 2);
    var dy = vh * 0.40 - (r.top + r.height / 2);
    var noCentro = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + escala + ')';
    flor.classList.add('flor-no-centro');
    flor.style.transform = noCentro;
    // o nome em letra cursiva fica logo abaixo da flor
    document.querySelector('.cortina-nome').style.marginTop = (vh * 0.40 + r.height * escala / 2 + 28) + 'px';

    anima('.cortina-pular', { opacity: [0, 1] }, { duration: 0.6, delay: 0.8 });
    var pronta = desenhaFlor(0.3, 1);
    anima('.cortina-nome', { opacity: [0, 1], filter: ['blur(12px)', 'blur(0px)'] }, { duration: 1.0, delay: pronta - 0.6, ease: suave });
    var sai = pronta + 0.45;
    anima('.cortina-nome, .cortina-pular', { opacity: 0 }, { duration: 0.4, delay: sai });
    anima(cortina, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] }, { duration: 1.1, delay: sai + 0.15, ease: caneta });
    anima(flor, { transform: [noCentro, 'translate(0px, 0px) scale(1)'] }, { duration: 1.3, delay: sai + 0.1, ease: caneta }).then(fim);
    revelaPalco(sai + 0.6);

    // tocar, rolar ou apertar uma tecla pula a abertura
    var pular = function () {
      eventos.forEach(function (ev) { window.removeEventListener(ev, pular); });
      controles.forEach(function (c) { c.complete(); });
      fim();
    };
    var eventos = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    eventos.forEach(function (ev) { window.addEventListener(ev, pular, { passive: true }); });
  } else {
    desenhaFlor(0.15, 0.7);
    revelaPalco(0.3);
  }

  // ---------------------------------------------------------------- rolagem
  M.scroll(
    M.animate('.gigante', { transform: ['translateY(0px)', 'translateY(110px)'] }, { ease: 'linear' }),
    { target: document.querySelector('.palco'), offset: ['start start', 'end start'] }
  );

  var deitada = window.matchMedia('(min-width: 900px)').matches;
  M.scroll(
    M.animate('.trilho-linha', { transform: deitada ? ['scaleX(0)', 'scaleX(1)'] : ['scaleY(0)', 'scaleY(1)'] }, { ease: 'linear' }),
    { target: document.querySelector('.trilho'), offset: ['start 85%', 'end 60%'] }
  );

  // os passos aparecem em ordem, uma vez só
  M.inView('.passos', function (lista) {
    M.animate(lista.querySelectorAll('li'), { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
      { duration: 0.7, delay: M.stagger(0.2), ease: suave });
  }, { amount: 0.3 });
})();
