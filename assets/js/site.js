/* R3 Motors. JavaScript puro, sem build. */
(function () {
  'use strict';

  var WA = '5535999702606';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function waLink(text) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
  }

  /* ---------- links de WhatsApp dos cards e botões ---------- */
  $$('[data-wa]').forEach(function (a) {
    a.href = waLink('Olá! Vi o ' + a.getAttribute('data-wa') + ' no site da R3 Motors e quero saber mais.');
  });
  $$('[data-wa-raw]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa-raw'));
  });

  /* ---------- menu e barra de cima ---------- */
  var nav = $('#nav');
  var toggle = $('#navToggle');
  var menu = $('#navMenu');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  var fab = $('#fab');
  var hero = $('#hero');
  var lastSolid = null, lastFab = null;
  function chrome() {
    var y = window.scrollY || window.pageYOffset;
    var solid = y > 24;
    if (solid !== lastSolid) { nav.classList.toggle('is-solid', solid); lastSolid = solid; }
    var showFab = y > window.innerHeight * 0.5;
    if (showFab !== lastFab) { fab.classList.toggle('is-on', showFab); lastFab = showFab; }
  }
  window.addEventListener('scroll', chrome, { passive: true });
  chrome();

  /* ---------- aparecer ao rolar ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    $$('.road').forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
    $$('.road').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- estoque: faixa de preço e ordem ---------- */
  var range = $('#priceRange');
  var out = $('#priceOut');
  var count = $('#count');
  var list = $('#cars');
  var empty = $('#empty');
  var cars = $$('.car', list);
  var sortDir = 'asc';
  var money = function (n) { return 'R$ ' + n.toLocaleString('pt-BR'); };

  function paintRange() {
    var min = +range.min, max = +range.max, v = +range.value;
    range.style.setProperty('--p', ((v - min) / (max - min) * 100) + '%');
    out.textContent = (v >= max ? 'Até ' : 'Até ') + money(v);
  }
  function applyFilter() {
    var limit = +range.value, shown = 0;
    cars.sort(function (a, b) {
      var d = (+a.dataset.price) - (+b.dataset.price);
      return sortDir === 'asc' ? d : -d;
    }).forEach(function (c) {
      var ok = (+c.dataset.price) <= limit;
      c.hidden = !ok;
      if (ok) shown++;
      list.appendChild(c);
    });
    count.textContent = shown + ' de ' + cars.length + ' veículo' + (cars.length === 1 ? '' : 's');
    empty.hidden = shown !== 0;
  }
  range.addEventListener('input', function () { paintRange(); applyFilter(); });
  $$('.chip[data-sort]').forEach(function (b) {
    b.addEventListener('click', function () {
      sortDir = b.getAttribute('data-sort');
      $$('.chip[data-sort]').forEach(function (o) {
        var on = o === b;
        o.classList.toggle('is-on', on);
        o.setAttribute('aria-pressed', String(on));
      });
      applyFilter();
    });
  });
  paintRange();
  applyFilter();

  /* ---------- formulário: abre o WhatsApp com a mensagem pronta ---------- */
  var form = $('#form');
  var note = $('#formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#fNome').value.trim();
    var field = $('#fNome').closest('.field');
    var err = $('#eNome');
    if (!nome) {
      field.classList.add('is-bad');
      err.hidden = false;
      $('#fNome').setAttribute('aria-invalid', 'true');
      $('#fNome').setAttribute('aria-describedby', 'eNome');
      $('#fNome').focus();
      return;
    }
    field.classList.remove('is-bad');
    err.hidden = true;
    $('#fNome').removeAttribute('aria-invalid');
    var tipo = $('#fTipo').value;
    var msg = $('#fMsg').value.trim();
    var intro = {
      comprar: 'quero comprar um veículo',
      vender: 'quero vender meu carro',
      outro: 'quero falar com a loja'
    }[tipo];
    var text = 'Olá! Meu nome é ' + nome + ' e ' + intro + '.' + (msg ? ' ' + msg : '');
    var url = waLink(text);
    var win = window.open(url, '_blank', 'noopener');
    note.innerHTML = win
      ? 'Pronto, o WhatsApp abriu com a sua mensagem. Se não abriu, <a href="' + url + '" target="_blank" rel="noopener">toque aqui</a>.'
      : 'Seu navegador bloqueou a janela. <a href="' + url + '" target="_blank" rel="noopener">Toque aqui para abrir o WhatsApp</a>.';
  });
  $('#fNome').addEventListener('input', function () {
    this.closest('.field').classList.remove('is-bad');
    $('#eNome').hidden = true;
  });

  /* ============================================================
     Hero em scroll: o vídeo real avança e volta com a rolagem
     ============================================================ */
  var track = $('#heroTrack');
  var video = $('#heroVideo');
  var img = $('#heroImg');
  var loadBox = $('#heroLoad');
  var ring = $('#ringFg');
  var loadTxt = $('#loadTxt');
  var railFill = $('#railFill');
  var cue = $('#cue');
  var beats = $$('.beat');

  var started = false;      // já tentou baixar o vídeo
  var ready = false;        // vídeo pronto para rolar
  var running = false;      // laço rAF ativo
  var duration = 0;
  var shown = 0;            // tempo que aparece na tela (suavizado)
  var lastSet = -1;         // último tempo escrito no vídeo
  var beatNow = -1, railNow = -1, cueOff = false;
  var objUrl = null;

  function fallback() {
    // Volta para a imagem fixa. A página continua completa.
    root.classList.remove('scrub-on');
    ready = false;
    if (img) img.src = img.getAttribute('data-end');
    loadBox.hidden = true;
  }

  function progress() {
    var r = track.getBoundingClientRect();
    var total = track.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    var p = -r.top / total;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function paintBeat(p) {
    var idx = 0;
    for (var i = 0; i < beats.length; i++) {
      if (p >= parseFloat(beats[i].getAttribute('data-from'))) idx = i;
    }
    if (idx !== beatNow) {
      beats.forEach(function (b, i) { b.classList.toggle('is-on', i === idx); });
      beatNow = idx;
    }
  }

  function frame() {
    var p = progress();
    var target = p * duration;
    var diff = target - shown;
    shown += diff * 0.14;
    if (Math.abs(diff) < 0.012) shown = target;

    // só escreve no vídeo quando mudou o bastante e o último seek terminou
    if (ready && !video.seeking && Math.abs(shown - lastSet) > 1 / 60) {
      try { video.currentTime = Math.min(shown, duration - 0.04); lastSet = shown; } catch (e) { /* ignora */ }
    }

    var rp = Math.round(p * 1000) / 1000;
    if (rp !== railNow) { railFill.style.transform = 'scaleX(' + rp + ')'; railNow = rp; paintBeat(p); }

    var off = p > 0.02;
    if (off !== cueOff) { cue.classList.toggle('is-off', off); cueOff = off; }

    // segue enquanto falta chegar no alvo ou o vídeo ainda não mostrou o tempo final
    if (shown !== target || (ready && Math.abs(shown - lastSet) > 1 / 60)) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function kick() {
    if (!ready || running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function setRing(pct) {
    ring.style.strokeDashoffset = String(100 - Math.round(pct));
  }

  function load() {
    if (started) return;
    started = true;
    img.src = img.getAttribute('data-start');
    loadBox.hidden = false;
    paintBeat(0);

    var done = function (blob) {
      objUrl = URL.createObjectURL(blob);
      video.src = objUrl;
      video.load();
    };

    // MP4 onde o navegador toca H.264, WebM nos demais
    var mp4ok = video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
    var webmok = video.canPlayType('video/webm; codecs="vp9"') !== '';
    if (!mp4ok && !webmok) { fallback(); return; }
    var file = mp4ok ? 'assets/video/scrub.mp4' : 'assets/video/scrub.webm';
    var mime = mp4ok ? 'video/mp4' : 'video/webm';

    var timer = setTimeout(function () { if (!ready) fallback(); }, 25000);

    // Aberto direto do computador (duplo clique): o navegador não deixa usar fetch.
    // O arquivo é local, então o vídeo pode ser ligado direto, sem baixar antes.
    if (location.protocol === 'file:') {
      video.preload = 'auto';
      video.src = file;
      video.load();
      return;
    }

    fetch(file).then(function (res) {
      if (!res.ok || !res.body) throw new Error('video');
      var len = +res.headers.get('Content-Length') || 0;
      var got = 0, chunks = [];
      var reader = res.body.getReader();
      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) return new Blob(chunks, { type: mime });
          chunks.push(r.value);
          got += r.value.length;
          if (len) {
            var pct = got / len * 100;
            setRing(pct);
            loadTxt.textContent = 'Carregando o vídeo da loja ' + Math.round(pct) + '%';
          }
          return pump();
        });
      })();
    }).then(function (blob) {
      clearTimeout(timer);
      done(blob);
    }).catch(function () {
      clearTimeout(timer);
      fallback();
    });
  }

  if (video) {
    video.addEventListener('loadedmetadata', function () {
      duration = video.duration || 0;
    });
    video.addEventListener('loadeddata', function () {
      if (!duration) duration = video.duration;
      ready = true;
      video.currentTime = 0;
      lastSet = 0;
      // Celulares só desenham os quadros depois de um play curto. Toca e pausa na hora.
      try {
        var pr = video.play();
        if (pr && pr.then) pr.then(function () { video.pause(); video.currentTime = 0; }).catch(function () {});
      } catch (e) { /* ignora */ }
      loadBox.classList.add('is-out');
      setTimeout(function () { loadBox.hidden = true; }, 520);
      kick();
    });
    video.addEventListener('error', function () { fallback(); });
    video.addEventListener('seeked', kick);
  }

  window.addEventListener('scroll', function () { kick(); }, { passive: true });

  if (root.classList.contains('scrub-on')) {
    load();
  }
})();
