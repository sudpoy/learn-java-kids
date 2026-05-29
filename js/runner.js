// ─── EXECUTE VIA JUDGE0 CE API ───
// Free public API, no auth required. language_id 62 = Java (OpenJDK 13)
async function executeCode(code, outputEl, statusEl, btn) {
  const runnable = wrapIfNeeded(code);
  btn.disabled = true;
  btn.textContent = '⏳ Running…';
  statusEl.textContent = '';
  outputEl.style.display = 'none';
  outputEl.className = 'cm-output';

  try {
    const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        source_code: runnable,
        language_id: 62,
        stdin: ''
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    let out = '';
    let isErr = false;
    const sid = data.status && data.status.id;

    if (sid === 6) {
      // Compilation Error
      out = (data.compile_output || 'Compilation error')
              .replace(/\/[^\s]*Main\.java:/g, 'Main.java:');
      isErr = true;
    } else if (sid >= 7 && sid <= 12) {
      // Runtime error variants
      out = data.stderr || data.message || ('Runtime error (status ' + sid + ')');
      isErr = true;
    } else if (sid === 5) {
      out = 'Time limit exceeded';
      isErr = true;
    } else {
      out = data.stdout || '';
      if (!out.trim()) out = '(no output)';
    }

    outputEl.textContent = out.trimEnd();
    outputEl.className = 'cm-output' + (isErr ? ' err' : '');
    outputEl.style.display = 'block';
    statusEl.textContent = isErr ? '✗ Error' : '✓ Done';
    statusEl.style.color  = isErr ? '#f87171' : '#10b981';

  } catch (e) {
    outputEl.textContent = '⚠ Could not reach the Java runner.\n' + e.message;
    outputEl.className = 'cm-output err';
    outputEl.style.display = 'block';
    statusEl.textContent = '✗ Failed';
    statusEl.style.color  = '#f87171';
  } finally {
    btn.disabled = false;
    btn.textContent = '▶ Run';
  }
}

// ─── WRAP SNIPPET IN A RUNNABLE CLASS IF NEEDED ───
// Judge0 compiles as Main.java, so the public class must be named Main.
function wrapIfNeeded(code) {
  const m = code.match(/\bpublic\s+class\s+(\w+)/);
  if (m) {
    const orig = m[1];
    if (orig !== 'Main') {
      // Rename class declaration only — not occurrences in strings/comments
      let fixed = code.replace(/(\bpublic\s+class\s+)\w+/, '$1Main');
      // Also rename constructor calls like "new Hello(" → "new Main("
      fixed = fixed.replace(new RegExp('(\\bnew\\s+)' + orig + '(\\s*\\()', 'g'), '$1Main$2');
      return fixed;
    }
    return code;
  }
  if (/\bclass\s+\w+/.test(code)) return code;
  return 'public class Main {\n    public static void main(String[] args) {\n'
       + code.split('\n').map(l => '        ' + l).join('\n')
       + '\n    }\n}';
}
