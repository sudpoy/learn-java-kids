// ─── LESSON DATA ───
const lessons = [
  {num:1,  title:'Java Foundations',            sub:'JVM · types · operators · casting',       color:'#4f46e5', live:true},
  {num:2,  title:'Control Flow',                sub:'if · switch · ternary · booleans',         color:'#8b5cf6', live:false},
  {num:3,  title:'Loops',                       sub:'for · while · do-while · break/continue',  color:'#06b6d4', live:false},
  {num:4,  title:'Arrays',                      sub:'1D · 2D · algorithms · Arrays API',        color:'#10b981', live:false},
  {num:5,  title:'Methods',                     sub:'parameters · overloading · scope',          color:'#f59e0b', live:false},
  {num:6,  title:'Recursion',                   sub:'base case · call stack · patterns',         color:'#ef4444', live:false},
  {num:7,  title:'Classes & Objects',           sub:'fields · constructors · this',             color:'#ec4899', live:false},
  {num:8,  title:'Encapsulation & Inheritance', sub:'private · extends · @Override',            color:'#f97316', live:false},
  {num:9,  title:'Strings & StringBuilder',     sub:'String API · immutability · parsing',      color:'#14b8a6', live:false},
  {num:10, title:'Collections',                 sub:'ArrayList · HashMap · generics',           color:'#6366f1', live:false},
];

let activeLesson = 1;
const loadedLessons = {};

// ─── BUILD SIDEBAR ───
const listEl = document.getElementById('lessonList');
lessons.forEach(l => {
  const item = document.createElement('div');
  item.className = 'lesson-item' + (l.num === 1 ? ' active' : '') + (l.live ? '' : ' locked');
  item.id = 'nav-' + l.num;
  item.innerHTML = `
    <div class="lesson-num">${l.num}</div>
    <div class="lesson-info">
      <div class="lesson-title">${l.title}</div>
      <div class="lesson-meta">${l.sub}</div>
      <span class="lesson-tag ${l.live ? 'tag-live' : 'tag-soon'}">${l.live ? '● LIVE' : 'Coming Soon'}</span>
    </div>`;
  if (l.live) {
    item.addEventListener('click', () => showLesson(l.num));
  }
  listEl.appendChild(item);
});

// ─── LESSON LOADER ───
// Fetches a lesson HTML fragment and injects it into its panel.
// Each lessons/lesson-N.html file contains the inner content of the panel
// (lesson-header + lesson-content / coming-soon). Cached after first load.
async function loadLesson(num) {
  if (loadedLessons[num]) return;
  const panel = document.getElementById('lesson-' + num);
  try {
    const r = await fetch(`./lessons/lesson-${num}.html`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    panel.innerHTML = await r.text();
    initCodeEditors();
    loadedLessons[num] = true;
  } catch (e) {
    panel.innerHTML = `<div style="padding:40px;color:#f87171;">⚠ Failed to load lesson ${num}: ${e.message}</div>`;
  }
}

// ─── NAVIGATION ───
async function showLesson(num) {
  await loadLesson(num);
  // Update sidebar
  document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-' + num).classList.add('active');
  // Update panels
  document.querySelectorAll('.lesson-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('lesson-' + num).classList.add('active');
  // Update progress
  activeLesson = num;
  const live = lessons.filter(l => l.live).length;
  document.getElementById('prog-text').textContent = `${live} of 10`;
  document.getElementById('prog-fill').style.width = (live / 10 * 100) + '%';
  // Scroll to top
  document.getElementById('main').scrollTop = 0;
}

// ─── CODE EDITOR INIT ───
// Replaces <pre><code class="language-java"> blocks with editable CodeMirror editors.
// Safe to call multiple times — skips blocks already converted (data-cm-done).
function initCodeEditors() {
  document.querySelectorAll('pre code.language-java').forEach(function(codeEl) {
    const pre = codeEl.parentElement;
    if (pre.dataset.cmDone) return;
    pre.dataset.cmDone = '1';

    const rawCode = codeEl.textContent;
    const wrap = document.createElement('div');
    wrap.className = 'cm-wrap';
    pre.parentNode.insertBefore(wrap, pre);

    const cm = CodeMirror(wrap, {
      value: rawCode,
      mode: 'text/x-java',
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: false,
      tabSize: 4,
      indentWithTabs: false,
      viewportMargin: Infinity,
      extraKeys: {
        'Tab':       function(cm){ cm.execCommand('indentMore'); },
        'Shift-Tab': function(cm){ cm.execCommand('indentLess'); }
      }
    });
    pre.remove();

    // Toolbar: Run + Reset + status badge
    const toolbar = document.createElement('div');
    toolbar.className = 'cm-toolbar';

    const runBtn = document.createElement('button');
    runBtn.className = 'cm-run-btn';
    runBtn.textContent = '▶ Run';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'cm-reset-btn';
    resetBtn.textContent = '↺ Reset';
    resetBtn.title = 'Restore original code';

    const statusEl = document.createElement('span');
    statusEl.className = 'cm-status-badge';

    toolbar.appendChild(runBtn);
    toolbar.appendChild(resetBtn);
    toolbar.appendChild(statusEl);
    wrap.appendChild(toolbar);

    // Inline output panel
    const outputEl = document.createElement('div');
    outputEl.className = 'cm-output';
    wrap.appendChild(outputEl);

    runBtn.addEventListener('click', function() {
      executeCode(cm.getValue(), outputEl, statusEl, runBtn);
    });

    resetBtn.addEventListener('click', function() {
      cm.setValue(rawCode);
      outputEl.style.display = 'none';
      statusEl.textContent = '';
    });
  });
}

// ─── BOOT ───
// Pre-load lesson 1 immediately so there's no delay on first view.
document.addEventListener('DOMContentLoaded', () => {
  loadLesson(1).then(() => {
    document.getElementById('lesson-1').classList.add('active');
    // Set initial progress bar
    const live = lessons.filter(l => l.live).length;
    document.getElementById('prog-fill').style.width = (live / 10 * 100) + '%';
  });
});
