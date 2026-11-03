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

  var topo = document.querySelector('[data-topo]');
  var whats = document.querySelector('[data-whats]');
  var abertura = document.querySelector('[data-abertura]');
  if (abertura && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      var passou = !entradas[0].isIntersecting;
      topo.classList.toggle('rolou', passou);
      whats.classList.toggle('visivel', passou);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(abertura);
  } else {
    topo.classList.add('rolou');
    whats.classList.add('visivel');
  }
})();
