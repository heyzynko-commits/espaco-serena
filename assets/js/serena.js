// Espaço Serena: aberto/fechado pelo horário da agenda e topo que aparece ao rolar.

(function () {
  // Horário da agenda online (ter a sex 8-12 e 13-17, sáb 8-12). 0 = domingo.
  var horario = {
    2: [[8, 12], [13, 17]], 3: [[8, 12], [13, 17]], 4: [[8, 12], [13, 17]],
    5: [[8, 12], [13, 17]], 6: [[8, 12]]
  };
  var dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  function agoraEmCampinas() {
    var p = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
    var v = {};
    p.forEach(function (x) { v[x.type] = x.value; });
    var semana = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[v.weekday];
    return { dia: semana, min: (parseInt(v.hour, 10) % 24) * 60 + parseInt(v.minute, 10) };
  }

  function hora(h) { return h === 12 ? 'meio-dia' : h + 'h'; }

  function status() {
    var a = agoraEmCampinas();
    var hoje = horario[a.dia] || [];
    for (var i = 0; i < hoje.length; i++) {
      if (a.min >= hoje[i][0] * 60 && a.min < hoje[i][1] * 60) {
        return { aberto: true, texto: 'Aberto agora, até ' + (hoje[i][1] === 12 ? 'o meio-dia' : 'as ' + hoje[i][1] + 'h') };
      }
    }
    for (var j = 0; j < hoje.length; j++) {
      if (a.min < hoje[j][0] * 60) return { aberto: false, texto: 'Fechado agora. Abre hoje às ' + hora(hoje[j][0]) };
    }
    for (var d = 1; d <= 7; d++) {
      var dia = (a.dia + d) % 7;
      if (horario[dia]) {
        var quando = d === 1 ? 'amanhã' : dias[dia];
        return { aberto: false, texto: 'Fechado agora. Abre ' + quando + ' às ' + hora(horario[dia][0][0]) };
      }
    }
  }

  var el = document.querySelector('[data-status]');
  if (el) {
    var s = status();
    if (s) { el.textContent = s.texto; el.classList.toggle('aberto', s.aberto); }
  }

  // Tour 360° (Pannellum). Só carrega as fotos quando a pessoa chega perto da seção.
  var tour = document.querySelector('[data-tour]');
  var botoes = document.querySelectorAll('[data-cena]');
  var viewer = null;
  function cena(arquivo) {
    return { type: 'equirectangular', panorama: 'assets/img/360/' + arquivo + '.jpg', hfov: 100, pitch: -4 };
  }
  function iniciaTour() {
    if (viewer || !window.pannellum || !tour) return;
    viewer = window.pannellum.viewer('tour', {
      default: { firstScene: 'recepcao', autoLoad: true, showZoomCtrl: false, compass: false, sceneFadeDuration: 600, mouseZoom: false },
      scenes: {
        recepcao: cena('recepcao'),
        rosto: cena('sala-rosto'),
        corpo: cena('sala-corpo'),
        unhas: cena('esmalteria')
      }
    });
  }
  botoes.forEach(function (b) {
    b.addEventListener('click', function () {
      iniciaTour();
      if (!viewer) return;
      viewer.loadScene(b.getAttribute('data-cena'));
      botoes.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });
  if (tour) {
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { iniciaTour(); if (viewer) obs.disconnect(); }
      }, { rootMargin: '300px 0px' });
      obs.observe(tour);
    } else {
      window.addEventListener('load', iniciaTour);
    }
  }

  // O WhatsApp flutuante aparece quando os botões da abertura saem da tela
  var whats = document.querySelector('[data-whats]');
  var abertura = document.querySelector('[data-abertura]');
  if (!whats) return;
  if (abertura && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      whats.classList.toggle('visivel', !entradas[0].isIntersecting);
    }, { rootMargin: '-70px 0px 0px 0px' }).observe(abertura);
  } else {
    whats.classList.add('visivel');
  }
})();
