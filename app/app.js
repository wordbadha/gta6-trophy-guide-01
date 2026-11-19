// Leonida Trophy Atlas — tracker for the 55 GTA VI trophies.
// Static only: it fetches data/trophies.json from its own folder and saves progress in localStorage.
// No network, no account, no cookies.
'use strict';

var STORE_KEY = 'leonida-trophy-atlas-v1';
var listEl = document.getElementById('trophy-list');
var detailBody = document.getElementById('detail-body');
var earnedCountEl = document.getElementById('earned-count');
var progressFill = document.getElementById('progress-fill');
var progressBar = document.getElementById('progress-bar');
var progressNote = document.getElementById('progress-note');
var gradeCountsEl = document.getElementById('grade-counts');
var resultCountEl = document.getElementById('result-count');
var searchEl = document.getElementById('search');
var kindEl = document.getElementById('filter-kind');
var gradeEl = document.getElementById('filter-grade');
var statusEl = document.getElementById('filter-status');
var spoilerEl = document.getElementById('spoiler-toggle');

var trophies = [];
var earned = {};   // id -> true
var spoilerOn = true;
var selectedId = null;

function loadStored() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    var data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      if (data.earned && typeof data.earned === 'object') earned = data.earned;
      if (typeof data.spoiler === 'boolean') spoilerOn = data.spoiler;
    }
  } catch (err) {
    earned = {};
  }
}

function saveStored() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: earned, spoiler: spoilerOn }));
  } catch (err) {
    /* storage full or blocked: the tracker still works for this visit */
  }
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isHiddenFrom(trophy) {
  return trophy.hidden && spoilerOn && !earned[trophy.id];
}

function matchesFilters(trophy) {
  var q = searchEl.value.trim().toLowerCase();
  if (q) {
    var hay = (trophy.name + ' ' + trophy.description).toLowerCase();
    if (hay.indexOf(q) === -1) return false;
  }
  var kind = kindEl.value;
  if (kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (kind !== 'all' && trophy.kind !== kind) {
    return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !earned[trophy.id]) return false;
  if (statusEl.value === 'unearned' && earned[trophy.id]) return false;
  return true;
}

function badge(text, cls) {
  var span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}

function renderProgress() {
  var total = trophies.length;
  var got = Object.keys(earned).length;
  earnedCountEl.textContent = String(got);
  progressFill.style.width = total ? Math.round((got / total) * 100) + '%' : '0%';
  progressBar.setAttribute('aria-valuenow', String(got));
  progressBar.setAttribute('aria-valuemax', String(total));
  if (got >= total && total > 0) {
    progressNote.textContent = 'Platinum: EARNED — Leonida Legend';
  } else {
    progressNote.textContent = 'Platinum: locked — ' + (total - got) + ' to go';
  }
  var byGrade = {};
  trophies.forEach(function (t) {
    if (!byGrade[t.grade]) byGrade[t.grade] = [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned[t.id]) byGrade[t.grade][0] += 1;
  });
  gradeCountsEl.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map(function (g) {
      var pair = byGrade[g] || [0, 0];
      return gradeLabel(g) + ' ' + pair[0] + '/' + pair[1];
    })
    .join(' · ');
  [1, 2, 3].forEach(function (stage) {
    var el = document.querySelector('[data-stage-count="' + stage + '"]');
    if (!el) return;
    var inStage = trophies.filter(function (t) { return t.stage === stage; });
    var done = inStage.filter(function (t) { return earned[t.id]; }).length;
    el.textContent = 'Stage ' + stage + ': ' + done + ' / ' + inStage.length + ' earned';
  });
}

function renderList() {
  listEl.replaceChildren();
  var shown = 0;
  trophies.forEach(function (trophy) {
    if (!matchesFilters(trophy)) return;
    shown += 1;
    var li = document.createElement('li');
    li.className = 'trophy-row' + (earned[trophy.id] ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : '');
    li.dataset.trophyId = String(trophy.id);

    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = !!earned[trophy.id];
    box.setAttribute('aria-label', 'Earned: ' + trophy.name);
    box.addEventListener('change', function () {
      if (box.checked) earned[trophy.id] = true;
      else delete earned[trophy.id];
      saveStored();
      renderAll();
    });
    box.addEventListener('click', function (event) { event.stopPropagation(); });

    var body = document.createElement('div');
    var nameEl = document.createElement('div');
    nameEl.className = 'trophy-name';
    var descEl = document.createElement('div');
    descEl.className = 'trophy-desc';
    if (isHiddenFrom(trophy)) {
      nameEl.textContent = 'Hidden trophy — earn it to reveal';
      descEl.textContent = 'A hidden story trophy. Its name and description stay hidden until you earn it.';
    } else {
      nameEl.textContent = trophy.name;
      descEl.textContent = trophy.description;
    }
    body.appendChild(nameEl);
    body.appendChild(descEl);

    var meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.appendChild(badge(gradeLabel(trophy.grade), 'grade-' + trophy.grade));
    meta.appendChild(badge(trophy.kind, 'kind-' + trophy.kind));
    if (trophy.missable) meta.appendChild(badge('Missable', 'missable'));
    if (trophy.hidden) meta.appendChild(badge('Hidden', 'hidden-flag'));
    if (!trophy.verified) meta.appendChild(badge('Details unconfirmed', 'unconfirmed'));
    if (typeof trophy.count === 'number') meta.appendChild(badge('× ' + trophy.count, 'count'));
    meta.appendChild(badge('Stage ' + trophy.stage, 'stage'));
    body.appendChild(meta);

    var gradeWord = document.createElement('div');
    gradeWord.className = 'trophy-grade-word';
    gradeWord.textContent = gradeLabel(trophy.grade);

    li.appendChild(box);
    li.appendChild(body);
    li.appendChild(gradeWord);
    li.addEventListener('click', function () {
      selectedId = trophy.id;
      renderAll();
    });
    li.tabIndex = 0;
    li.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedId = trophy.id;
        renderAll();
      }
    });
    listEl.appendChild(li);
  });
  resultCountEl.textContent = shown + ' of ' + trophies.length + ' trophies shown';
}

function renderDetail() {
  detailBody.replaceChildren();
  var trophy = trophies.find(function (t) { return t.id === selectedId; });
  if (!trophy) {
    var hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = 'Select a trophy from the checklist to read its guide, its sources and whether its steps are verified.';
    detailBody.appendChild(hint);
    return;
  }
  if (isHiddenFrom(trophy)) {
    var hiddenNote = document.createElement('p');
    hiddenNote.className = 'hidden-note';
    hiddenNote.textContent = 'This is one of the 28 hidden trophies. Its name, description and guide stay hidden while the spoiler setting is on — earn it (or switch the setting off) to reveal it.';
    detailBody.appendChild(hiddenNote);
    return;
  }
  var title = document.createElement('h3');
  title.textContent = trophy.name;
  detailBody.appendChild(title);

  var desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = '“' + trophy.description + '” — official description, ' + gradeLabel(trophy.grade) + '.';
  detailBody.appendChild(desc);

  var meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.appendChild(badge(gradeLabel(trophy.grade), 'grade-' + trophy.grade));
  meta.appendChild(badge(trophy.kind, 'kind-' + trophy.kind));
  if (trophy.missable) meta.appendChild(badge('Missable', 'missable'));
  if (trophy.hidden) meta.appendChild(badge('Hidden', 'hidden-flag'));
  if (typeof trophy.count === 'number') meta.appendChild(badge('Count: ' + trophy.count, 'count'));
  meta.appendChild(badge('Roadmap stage ' + trophy.stage, 'stage'));
  detailBody.appendChild(meta);

  if (trophy.missable) {
    var warn = document.createElement('p');
    warn.className = 'missable-banner';
    warn.textContent = 'Missable: this is the only missable trophy in the game. Meditate at every spot during the story — it cannot be earned after the finale.';
    detailBody.appendChild(warn);
  }

  var guideTitle = document.createElement('h4');
  guideTitle.textContent = 'Guide';
  detailBody.appendChild(guideTitle);
  var guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = trophy.guide;
  detailBody.appendChild(guide);

  if (!trophy.verified) {
    var unconfirmed = document.createElement('p');
    unconfirmed.className = 'unconfirmed-note';
    unconfirmed.textContent = 'Details unconfirmed: the steps above go beyond the official description. Confirm them against the cited guide before you grind.';
    detailBody.appendChild(unconfirmed);
  }

  var sources = document.createElement('p');
  sources.className = 'detail-sources';
  var strong = document.createElement('strong');
  strong.textContent = 'Sources: ';
  sources.appendChild(strong);
  sources.appendChild(document.createTextNode(trophy.sources.join(', ') + '. Cited, never copied — the guide above is written in our own words.'));
  detailBody.appendChild(sources);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

function exportProgress() {
  var payload = JSON.stringify({ app: 'leonida-trophy-atlas', earned: Object.keys(earned).map(Number).sort(function (a, b) { return a - b; }), exportedAt: new Date().toISOString() }, null, 2);
  var url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  var a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  a.click();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function importProgress(file) {
  file.text().then(function (text) {
    var data = JSON.parse(text);
    var ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    var next = {};
    ids.forEach(function (id) {
      var n = Number(id);
      if (trophies.some(function (t) { return t.id === n; })) next[n] = true;
    });
    earned = next;
    saveStored();
    renderAll();
  }).catch(function () {
    resultCountEl.textContent = 'That file could not be imported — it needs an earned list of trophy ids.';
  });
}

function applyUrlParams() {
  var params = new URLSearchParams(window.location.search);
  var grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].indexOf(grade) !== -1) gradeEl.value = grade;
  var kind = params.get('kind');
  if (kind && ['story', 'missable', 'collectibles', 'activities', 'online'].indexOf(kind) !== -1) kindEl.value = kind;
  if (params.get('spoiler') === 'off') {
    spoilerOn = false;
    spoilerEl.checked = false;
  }
  var selected = Number(params.get('trophy'));
  if (selected && trophies.some(function (t) { return t.id === selected; })) selectedId = selected;
}

async function init() {
  loadStored();
  spoilerEl.checked = spoilerOn;
  var response = await fetch('data/trophies.json');
  var doc = await response.json();
  trophies = doc.trophies.slice().sort(function (a, b) { return a.id - b.id; });
  applyUrlParams();

  searchEl.addEventListener('input', renderList);
  kindEl.addEventListener('change', renderList);
  gradeEl.addEventListener('change', renderList);
  statusEl.addEventListener('change', renderList);
  spoilerEl.addEventListener('change', function () {
    spoilerOn = spoilerEl.checked;
    saveStored();
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-btn').addEventListener('click', function () {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', function (event) {
    var file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', function () {
    if (window.confirm('Reset all earned trophies? This clears the saved progress in this browser.')) {
      earned = {};
      saveStored();
      renderAll();
    }
  });

  renderAll();
}

init().catch(function (err) {
  resultCountEl.textContent = 'Could not load the trophy list: ' + err.message;
});
