// ─── LESSON 2 DEMO: GRADE CALCULATOR ───
function runGrade() {
  const raw = document.getElementById('grade-score').value;
  const el  = document.getElementById('grade-result');
  const score = parseInt(raw, 10);

  if (isNaN(score) || score < 0 || score > 100) {
    el.textContent = '⚠ Enter a number between 0 and 100.';
    return;
  }

  let grade, msg, branch;
  if (score >= 90) {
    grade = 'A'; msg = 'Excellent!';
    branch = 'if (score >= 90)  ✓ FIRES';
  } else if (score >= 80) {
    grade = 'B'; msg = 'Good job!';
    branch = 'else if (score >= 80)  ✓ FIRES';
  } else if (score >= 70) {
    grade = 'C'; msg = 'Passing';
    branch = 'else if (score >= 70)  ✓ FIRES';
  } else if (score >= 60) {
    grade = 'D'; msg = 'Needs improvement';
    branch = 'else if (score >= 60)  ✓ FIRES';
  } else {
    grade = 'F'; msg = 'Please see your teacher';
    branch = 'else  ✓ FIRES  (no condition matched above)';
  }

  el.textContent =
    `Score: ${score}\n` +
    `\nCondition path:\n` +
    `  if (score >= 90)          ${score >= 90 ? '✓ FIRES → Grade A' : '✗ skip'}\n` +
    `  else if (score >= 80)     ${score >= 80 && score < 90 ? '✓ FIRES → Grade B' : (score >= 80 ? '(already matched above)' : '✗ skip')}\n` +
    `  else if (score >= 70)     ${score >= 70 && score < 80 ? '✓ FIRES → Grade C' : (score >= 70 ? '(already matched above)' : '✗ skip')}\n` +
    `  else if (score >= 60)     ${score >= 60 && score < 70 ? '✓ FIRES → Grade D' : (score >= 60 ? '(already matched above)' : '✗ skip')}\n` +
    `  else                      ${score < 60 ? '✓ FIRES → Grade F' : '(already matched above)'}\n` +
    `\nResult: Grade ${grade} — ${msg}`;
}

// ─── DEMO 1: TYPE CASTING EXPLORER ───
function runCast() {
  const v = parseFloat(document.getElementById('cast-val').value);
  const t = document.getElementById('cast-to').value;
  const el = document.getElementById('cast-result');
  if (isNaN(v)) { el.textContent = '⚠ Enter a number first.'; return; }
  let out = '';
  if (t === 'int-from-double') {
    const trunc = Math.trunc(v);
    out = `double value = ${v};\nint result = (int) value;\n\n// Result: ${trunc}\n// Note: decimal part is dropped (not rounded!)`;
  } else if (t === 'double-from-int') {
    const i = Math.trunc(v);
    out = `int value = ${i};\ndouble result = value;  // widening — automatic\n\n// Result: ${i}.0\n// Widening is always safe — no data loss`;
  } else if (t === 'char-from-int') {
    const code = Math.trunc(v);
    const ch = (code >= 0 && code <= 65535) ? String.fromCharCode(code) : '?';
    out = `int value = ${code};\nchar result = (char) value;\n\n// Result: '${ch}'\n// Unicode code point ${code} maps to character '${ch}'`;
  } else if (t === 'int-from-char') {
    const code = Math.trunc(v);
    const ch = String.fromCharCode(code % 65536);
    out = `char value = '${ch}';\nint result = value;  // widening — char stores as number\n\n// Result: ${code}\n// '${ch}' has Unicode value ${code}`;
  } else {
    const a = Math.trunc(v), b = 3;
    out = `int a = ${a}, b = ${b};\n\nint intResult = a / b;              // ${Math.trunc(a/b)}\ndouble doubleResult = (double)a / b; // ${(a/b).toFixed(6).replace(/0+$/, '')}\n\n// Integer division truncates the decimal.\n// Cast one operand to double before dividing.`;
  }
  el.textContent = out;
}

// ─── DEMO 2: OPERATOR SANDBOX ───
function runOps() {
  const a = parseFloat(document.getElementById('op-a').value);
  const b = parseFloat(document.getElementById('op-b').value);
  const el = document.getElementById('ops-result');
  if (isNaN(a) || isNaN(b)) { el.textContent = '⚠ Enter two numbers.'; return; }
  const ai = Math.trunc(a), bi = Math.trunc(b);
  const lines = [
    `// a = ${ai}, b = ${bi}`,
    `a + b   = ${ai + bi}`,
    `a - b   = ${ai - bi}`,
    `a * b   = ${ai * bi}`,
    `a / b   = ${bi !== 0 ? Math.trunc(ai/bi) : 'ArithmeticException (÷ by 0)'}  ← integer division`,
    `a % b   = ${bi !== 0 ? ((ai % bi + bi) % bi) : 'ArithmeticException'}  ← remainder`,
    `(double)a / b = ${bi !== 0 ? (ai/bi).toFixed(4).replace(/\.?0+$/,'') : 'error'}  ← decimal division`,
    ``,
    `// Comparison`,
    `a == b  = ${ai === bi}`,
    `a != b  = ${ai !== bi}`,
    `a >  b  = ${ai > bi}`,
    `a >= b  = ${ai >= bi}`,
    ``,
    `// Post-increment`,
    `a++     prints ${ai}, then a becomes ${ai+1}`,
    `++a     a becomes ${ai+1}, then prints ${ai+1}`,
  ];
  el.textContent = lines.join('\n');
}

// ─── HINT TOGGLES ───
function toggleHint(id) {
  const box = document.getElementById(id);
  const btn = box.previousElementSibling;
  const visible = box.style.display === 'block';
  box.style.display = visible ? 'none' : 'block';
  btn.textContent = visible ? 'Show hint' : 'Hide hint';
}

// ─── QUIZ ───
function qa(btn, correct) {
  const item = btn.closest('.q-item');
  if (item.querySelector('.q-opt[disabled]')) return;
  item.querySelectorAll('.q-opt').forEach(b => b.disabled = true);
  const fb = item.querySelector('.q-fb');
  if (correct) {
    btn.classList.add('correct');
    fb.textContent = '✓ Correct!'; fb.style.color = '#34d399';
  } else {
    btn.classList.add('wrong');
    item.querySelectorAll('.q-opt').forEach(b => {
      if (b.onclick.toString().includes('true')) b.classList.add('correct');
    });
    fb.textContent = '✗ Not quite — correct answer highlighted.'; fb.style.color = '#f87171';
  }
}
