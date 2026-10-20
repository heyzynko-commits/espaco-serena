/* Espaço Serena: o que se mexe no site.
   1. Painel "aberto agora" (funciona mesmo sem animação).
   2. Fundo: fumaça dourada que se mexe sozinha e segue o cursor (ou o dedo).
   3. Estrelinhas douradas caindo enquanto a pessoa rola a página.
   4. Abertura: a flor se desenha no meio da tela, a cortina sobe e a flor desliza pro
      lugar dela, na frente do SERENA gigante. Uma vez por visita; toque pula.
   5. Em cada seção, uma florzinha se desenha como na abertura e o conteúdo entra em ordem.
   Quem pediu menos movimento no celular vê o degradê parado e tudo no lugar.
   Cores do manual da marca: dourado #DAA739 (218,167,57) e grafite #373435. */
(function () {
  var raiz = document.documentElement;
  var mexe = raiz.classList.contains('anima');

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

  // ---------------------------------------------------------------- fumaça dourada
  (function fumaca() {
    var tela = document.querySelector('.fumaca');
    if (!tela || !tela.getContext) return;
    var ctx = tela.getContext('2d');
    var ESCALA = 0.22; // desenha pequeno e o navegador amplia: fica macio como fumaça e pesa pouco
    var w = 1, h = 1;
    function medir() {
      w = tela.width = Math.max(1, Math.round(window.innerWidth * ESCALA));
      h = tela.height = Math.max(1, Math.round(window.innerHeight * ESCALA));
    }
    medir();
    window.addEventListener('resize', medir);

    // cor, opacidade, tamanho, esticada e velocidade de cada faixa de fumaça
    var nuvens = [
      { x: .18, y: .22, r: .55, cor: '218,167,57', a: .34, vx: .11, vy: .08, f: 0, sx: 1.9, sy: .75, gira: .03 },
      { x: .82, y: .30, r: .50, cor: '242,222,170', a: .60, vx: .07, vy: .12, f: 1.7, sx: 1.6, sy: .8, gira: -.025 },
      { x: .55, y: .82, r: .62, cor: '218,167,57', a: .30, vx: .09, vy: .06, f: 3.1, sx: 2.2, sy: .65, gira: .02 },
      { x: .28, y: .70, r: .46, cor: '236,205,120', a: .36, vx: .13, vy: .10, f: 4.4, sx: 1.7, sy: .7, gira: -.035 },
      { x: .70, y: .58, r: .40, cor: '255,250,238', a: .75, vx: .10, vy: .09, f: 2.2, sx: 1.5, sy: .9, gira: .04 },
      { x: .45, y: .40, r: .36, cor: '228,186,84', a: .28, vx: .15, vy: .11, f: 5.3, sx: 2.4, sy: .55, gira: .05 },
      { x: .88, y: .78, r: .42, cor: '196,146,40', a: .22, vx: .12, vy: .14, f: 6.1, sx: 2.6, sy: .5, gira: -.045 },
      { x: .10, y: .52, r: .38, cor: '196,146,40', a: .18, vx: .14, vy: .09, f: 0.9, sx: 2.3, sy: .6, gira: .035 }
    ];
    var alvo = { x: .5, y: .35 }, cursor = { x: .5, y: .35 };
    window.addEventListener('scroll', function () {
      if (window.matchMedia('(pointer: coarse)').matches) {
        alvo.x = .5 + Math.sin(window.scrollY / 260) * .3;
        alvo.y = .35 + Math.cos(window.scrollY / 340) * .2;
      }
    }, { passive: true });
    window.addEventListener('pointermove', function (e) {
      alvo.x = e.clientX / window.innerWidth;
      alvo.y = e.clientY / window.innerHeight;
    }, { passive: true });

    function quadro(ms) {
      var t = ms / 1000;
      var alturaUtil = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var rolagem = window.scrollY / alturaUtil;
      cursor.x += (alvo.x - cursor.x) * .035;
      cursor.y += (alvo.y - cursor.y) * .035;

      var base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, '#FFFCF4');
      base.addColorStop(.6, '#FAF0D9');
      base.addColorStop(1, '#F4E3BC');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      var m = Math.max(w, h);
      for (var i = 0; i < nuvens.length; i++) {
        var n = nuvens[i];
        var x = (n.x + Math.sin(t * n.vx + n.f) * .16 + Math.sin(t * n.vx * 2.3 + n.f * 2) * .05 + (cursor.x - .5) * .06 * (i % 2 ? 1 : -1)) * w;
        var y = (n.y + Math.cos(t * n.vy + n.f) * .12 + Math.sin(rolagem * 6.28 + n.f) * .1 + (cursor.y - .5) * .05) * h;
        var r = n.r * m * (1 + Math.sin(t * .2 + n.f) * .12);
        ctx.setTransform(n.sx, 0, 0, n.sy, x, y);
        ctx.rotate(t * n.gira + n.f);
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, 'rgba(' + n.cor + ',' + n.a + ')');
        g.addColorStop(.5, 'rgba(' + n.cor + ',' + (n.a * .35) + ')');
        g.addColorStop(1, 'rgba(' + n.cor + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(-r, -r, r * 2, r * 2);
      }

      // a nuvem que segue o cursor
      var cx = cursor.x * w, cy = cursor.y * h, cr = .42 * m;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var c = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      c.addColorStop(0, 'rgba(222,174,64,.5)');
      c.addColorStop(.5, 'rgba(222,174,64,.16)');
      c.addColorStop(1, 'rgba(228,186,84,0)');
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);

      if (mexe) window.requestAnimationFrame(quadro);
    }
    window.requestAnimationFrame(quadro);
  })();

  if (!mexe) return; // daqui pra baixo é só movimento

  // ---------------------------------------------------------------- estrelinhas ao rolar
  (function estrelas() {
    var tela = document.querySelector('.estrelas');
    if (!tela || !tela.getContext) return;
    var ctx = tela.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function medir() {
      tela.width = window.innerWidth * dpr;
      tela.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    medir();
    window.addEventListener('resize', medir);

    var lista = [], rodando = false, ultimo = window.scrollY;
    function nova(forca) {
      lista.push({
        x: Math.random() * window.innerWidth,
        y: -12 + Math.random() * window.innerHeight * .4,
        vy: .5 + Math.random() * 1.1 + forca * .35,
        vx: (Math.random() - .5) * .4,
        tam: 4 + Math.random() * 7,
        vida: 0, dura: 80 + Math.random() * 90,
        giro: Math.random() * 6.28, fase: Math.random() * 6.28,
        cor: Math.random() < .7 ? '#C38F22' : (Math.random() < .5 ? '#DAA739' : '#FFF6DA')
      });
    }
    function desenhaEstrela(r) { // estrela de 4 pontas, fina, como um brilho
      ctx.beginPath();
      for (var k = 0; k < 4; k++) {
        var a = k * Math.PI / 2, b = a + Math.PI / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        ctx.lineTo(Math.cos(b) * r * .26, Math.sin(b) * r * .26);
      }
      ctx.closePath();
      ctx.fill();
    }
    function passo() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (var i = lista.length - 1; i >= 0; i--) {
        var e = lista[i];
        e.vida++;
        e.y += e.vy;
        e.x += e.vx + Math.sin((e.vida + e.fase * 20) / 18) * .25;
        e.giro += .02;
        var p = e.vida / e.dura;
        if (p >= 1 || e.y > window.innerHeight + 20) { lista.splice(i, 1); continue; }
        var alfa = p < .18 ? p / .18 : 1 - (p - .18) / .82;
        var pisca = .7 + .3 * Math.sin(e.vida / 4 + e.fase);
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.giro);
        ctx.globalAlpha = alfa;
        ctx.shadowColor = 'rgba(228,186,84,.9)';
        ctx.shadowBlur = 14;
        ctx.fillStyle = e.cor;
        desenhaEstrela(e.tam * pisca);
        ctx.restore();
      }
      if (lista.length) window.requestAnimationFrame(passo);
      else { rodando = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }
    window.addEventListener('scroll', function () {
      var d = Math.abs(window.scrollY - ultimo);
      ultimo = window.scrollY;
      var n = Math.min(7, Math.floor(d / 28) + (Math.random() < .6 ? 1 : 0));
      for (var i = 0; i < n && lista.length < 90; i++) nova(Math.min(3, d / 60));
      if (!rodando && lista.length) { rodando = true; window.requestAnimationFrame(passo); }
    }, { passive: true });
  })();

  // ---------------------------------------------------------------- recorte da taça no SERENA
  var flor = document.querySelector('.flor');
  var gigante = document.querySelector('.gigante');
  function mascara() {
    if (!flor || !gigante || flor.classList.contains('flor-no-centro')) return;
    var g = gigante.getBoundingClientRect(), f = flor.getBoundingClientRect();
    gigante.style.setProperty('--mx', (f.left - g.left) + 'px');
    gigante.style.setProperty('--my', (f.top - g.top) + 'px');
    gigante.style.setProperty('--mw', f.width + 'px');
    gigante.style.setProperty('--mh', f.height + 'px');
    gigante.classList.add('com-mascara');
  }
  mascara();
  if (document.fonts) document.fonts.ready.then(mascara);
  window.addEventListener('resize', mascara);

  // ---------------------------------------------------------------- animação (Motion)
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

  var cortina = document.querySelector('.cortina');
  function tracos(ordem) { return flor.querySelectorAll('.flor-tracos path[data-ordem="' + ordem + '"]'); }

  // A flor se desenha como uma caneta: caule, taça (as mãos), pétalas, o V e por fim a ponta.
  function desenhaFlor(t0, ritmo) {
    anima(tracos(1), { strokeDashoffset: [1, 0] }, { duration: 0.5 * ritmo, delay: t0, ease: caneta });
    anima(tracos(2), { strokeDashoffset: [1, 0] }, { duration: 1.1 * ritmo, delay: t0 + 0.35 * ritmo, ease: caneta });
    anima(tracos(3), { strokeDashoffset: [1, 0] }, { duration: 1.0 * ritmo, delay: t0 + 0.8 * ritmo, ease: caneta });
    anima(tracos(4), { strokeDashoffset: [1, 0] }, { duration: 0.7 * ritmo, delay: t0 + 1.3 * ritmo, ease: caneta });
    anima(tracos(5), { strokeDashoffset: [1, 0] }, { duration: 0.8 * ritmo, delay: t0 + 1.5 * ritmo, ease: caneta });
    var pronta = t0 + 2.3 * ritmo;
    anima('.flor-brilho', { transform: ['translateX(-90px)', 'translateX(250px)'] }, { duration: 1.2, delay: pronta - 0.1, ease: [0.4, 0, 0.2, 1] });
    return pronta;
  }

  function revelaPalco(t) {
    // o Serena se escreve da esquerda pra direita, como a mão escrevendo o nome do logo
    anima('.gigante span', { clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'] }, { duration: 1.8, delay: t, ease: [0.45, 0, 0.25, 1] });
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
    mascara();
  }

  if (raiz.classList.contains('intro')) {
    try { sessionStorage.setItem('serena-abertura', '1'); } catch (e) { /* aba anônima */ }

    var r = flor.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var escala = Math.min(vw * 0.56, 300) / r.width;
    var dx = vw / 2 - (r.left + r.width / 2);
    var dy = vh * 0.40 - (r.top + r.height / 2);
    var noCentro = 'translate(' + dx + 'px, ' + dy + 'px) scale(' + escala + ')';
    flor.classList.add('flor-no-centro');
    flor.style.transform = noCentro;
    document.querySelector('.cortina-nome').style.marginTop = (vh * 0.40 + r.height * escala / 2 + 22) + 'px';

    anima('.cortina-pular', { opacity: [0, 1] }, { duration: 0.6, delay: 0.8 });
    var pronta = desenhaFlor(0.3, 1);
    anima('.cortina-nome', { opacity: [0, 1], filter: ['blur(12px)', 'blur(0px)'] }, { duration: 1.0, delay: pronta - 0.6, ease: suave });
    var sai = pronta + 0.45;
    anima('.cortina-nome, .cortina-pular', { opacity: 0 }, { duration: 0.4, delay: sai });
    anima(cortina, { clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] }, { duration: 1.1, delay: sai + 0.15, ease: caneta });
    anima(flor, { transform: [noCentro, 'translate(0px, 0px) scale(1)'] }, { duration: 1.3, delay: sai + 0.1, ease: caneta }).then(fim);
    revelaPalco(sai + 0.6);

    var eventos = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    var pular = function () {
      eventos.forEach(function (ev) { window.removeEventListener(ev, pular); });
      controles.forEach(function (c) { c.complete(); });
      fim();
    };
    eventos.forEach(function (ev) { window.addEventListener(ev, pular, { passive: true }); });
  } else {
    desenhaFlor(0.15, 0.7);
    revelaPalco(0.3);
  }

  // ---------------------------------------------------------------- seções, como na abertura
  // a florzinha de cada seção se desenha quando aparece
  document.querySelectorAll('.selo').forEach(function (selo) {
    M.inView(selo, function () {
      M.animate(selo, { strokeDashoffset: [1, 0] }, { duration: 1.6, ease: caneta });
    }, { amount: 0.6 });
  });

  // a linha dourada de cada grupo de tratamentos se desenha da esquerda pra direita
  document.querySelectorAll('.grupo').forEach(function (grupo) {
    M.inView(grupo, function () {
      M.animate(grupo, { '--linha-x': ['0%', '100%'] }, { duration: 1.2, ease: caneta });
    }, { amount: 0.3 });
  });

  // o resto entra em ordem: título, texto, itens
  var entram = document.querySelectorAll(
    '.secao-topo h2, .secao-lede, .grupo h3, .grupo li, .grupo .link, .diagonal-conteudo > *, ' +
    '.pergunta, .onde h2, .onde h3, .endereco, .onde .link, .horario > div, .onde p, .rodape-in > *'
  );
  entram.forEach(function (el) { el.classList.add('entra'); });
  entram.forEach(function (el) {
    var irmaos = Array.prototype.filter.call(el.parentElement.children, function (x) { return x.classList.contains('entra'); });
    var ordem = irmaos.indexOf(el);
    M.inView(el, function () {
      M.animate(el, { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] },
        { duration: 0.8, delay: Math.min(ordem, 8) * 0.08, ease: suave });
    }, { amount: 0.4 });
  });

  // a linha que liga os passos acompanha a rolagem
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
