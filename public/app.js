(function () {
  var FIB = ['1', '2', '3', '5', '8', '13', '21', '?'];
  var $ = function (s) { return document.querySelector(s); };
  var me = { name: '', code: '', round: 0, vote: null };
  var timer = null, editingStory = false;

  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key) || ''; } catch (e) { return ''; } }
  function fmt(n) { return n == null ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }); }

  function show(el, text) { el.textContent = text; el.hidden = !text; }

  async function call(method, body, code) {
    var url = '/api/room' + (method === 'GET' ? '?code=' + encodeURIComponent(code) : '');
    var res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || 'Erro ao falar com o servidor.');
    return data;
  }

  function enterRoom(state) {
    me.code = state.code;
    store('poker-name', me.name);
    store('poker-code', me.code);
    $('#home').style.display = 'none';
    $('#room').style.display = 'flex';
    $('#room').hidden = false;
    $('#roomCode').textContent = state.code;
    draw(state);
    clearInterval(timer);
    timer = setInterval(refresh, 2000);
  }

  function leave() {
    clearInterval(timer);
    store('poker-code', '');
    $('#room').style.display = 'none';
    $('#home').style.display = '';
  }

  async function refresh() {
    try {
      draw(await call('GET', null, me.code));
      show($('#roomError'), '');
    } catch (e) { show($('#roomError'), e.message); }
  }

  function draw(s) {
    if (s.round !== me.round) { me.vote = null; me.round = s.round; }
    $('#roundInfo').textContent = 'Rodada ' + s.round + ' · ' + s.players.length + ' na sala';
    if (!editingStory) $('#story').value = s.story;

    var pl = $('#players');
    pl.textContent = '';
    s.players.forEach(function (p) {
      var d = document.createElement('div'); d.className = 'player';
      var f = document.createElement('div');
      f.className = 'face' + (s.revealed ? ' shown' : p.voted ? ' voted' : '');
      f.textContent = s.revealed ? (p.vote === null ? '–' : p.vote) : p.voted ? '✓' : '…';
      var n = document.createElement('div'); n.textContent = p.name + (p.name === me.name ? ' (você)' : '');
      d.appendChild(f); d.appendChild(n); pl.appendChild(d);
    });

    var hand = $('#hand');
    hand.textContent = '';
    FIB.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'pick'; b.textContent = v; b.disabled = s.revealed;
      b.setAttribute('aria-pressed', me.vote === v ? 'true' : 'false');
      b.onclick = function () { vote(v); };
      hand.appendChild(b);
    });

    $('#reveal').disabled = s.revealed || !s.players.some(function (p) { return p.voted; });

    var box = $('#result');
    if (!s.revealed || !s.summary) { box.hidden = true; return; }
    var r = s.summary;
    box.hidden = false;
    if (r.suggested == null) {
      box.innerHTML = '<div class="flag">Todos votaram "?". Falta entender a história antes de estimar.</div>';
      return;
    }
    box.innerHTML = '<div class="muted">Resultado</div><div class="big"></div><div class="muted"></div><div></div>';
    box.children[1].textContent = r.suggested + ' pontos';
    box.children[2].textContent = 'Média ' + fmt(r.mean) + ' · mediana ' + fmt(r.median) + ' · menor ' + r.min + ' · maior ' + r.max;
    var msg = box.children[3];
    msg.className = r.divergent ? 'flag' : 'ok';
    msg.textContent = r.divergent
      ? 'Divergência alta. Quem votou ' + r.min + ' e quem votou ' + r.max + ' explicam o motivo e todos votam de novo.'
      : 'Votos próximos. Pode fechar em ' + r.suggested + ' pontos.';
    if (r.questionMarks) msg.textContent += ' ' + r.questionMarks + ' voto(s) "?": a história pode estar confusa demais.';
  }

  async function vote(v) {
    try {
      draw(await call('POST', { action: 'vote', code: me.code, name: me.name, value: v }));
      me.vote = v;
      draw(await call('GET', null, me.code));
    } catch (e) { show($('#roomError'), e.message); }
  }

  async function act(action, extra) {
    try {
      var body = Object.assign({ action: action, code: me.code }, extra || {});
      draw(await call('POST', body));
      show($('#roomError'), '');
    } catch (e) { show($('#roomError'), e.message); }
  }

  function readName() {
    me.name = $('#name').value.trim();
    if (!me.name) { show($('#homeError'), 'Informe seu nome.'); return false; }
    return true;
  }

  $('#create').onclick = async function () {
    if (!readName()) return;
    try { enterRoom(await call('POST', { action: 'create', name: me.name })); show($('#homeError'), ''); }
    catch (e) { show($('#homeError'), e.message); }
  };
  $('#join').onclick = async function () {
    if (!readName()) return;
    var code = $('#code').value.trim().toUpperCase();
    if (!code) { show($('#homeError'), 'Informe o código da sala.'); return; }
    try { enterRoom(await call('POST', { action: 'join', code: code, name: me.name })); show($('#homeError'), ''); }
    catch (e) { show($('#homeError'), e.message); }
  };
  $('#leave').onclick = leave;
  $('#reveal').onclick = function () { act('reveal'); };
  $('#reset').onclick = function () { me.vote = null; act('reset'); };
  $('#saveStory').onclick = function () { editingStory = false; act('story', { story: $('#story').value }); };
  $('#story').oninput = function () { editingStory = true; };

  $('#name').value = load('poker-name');
  var saved = load('poker-code');
  if (saved && $('#name').value) {
    me.name = $('#name').value;
    call('POST', { action: 'join', code: saved, name: me.name }).then(enterRoom).catch(function () { store('poker-code', ''); });
  }
})();
