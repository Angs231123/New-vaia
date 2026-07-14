// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav.primary');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // Countdown to next event
  const cd = document.getElementById('countdown');
  if (cd) {
    const target = new Date(cd.dataset.target).getTime();
    const els = {
      d: document.getElementById('cd-d'),
      h: document.getElementById('cd-h'),
      m: document.getElementById('cd-m'),
      s: document.getElementById('cd-s'),
    };
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        cd.querySelector('.cd-label').textContent = 'Event in progress — check the schedule';
        Object.values(els).forEach(el => el && (el.textContent = '00'));
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (els.d) els.d.textContent = String(d).padStart(2, '0');
      if (els.h) els.h.textContent = String(h).padStart(2, '0');
      if (els.m) els.m.textContent = String(m).padStart(2, '0');
      if (els.s) els.s.textContent = String(s).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  }

  document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));

  // Display application form -> pre-filled email (no backend required)
  const appForm = document.getElementById('apply-form');
  if (appForm) {
    const statusEl = document.getElementById('apply-status');
    appForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const val = (id) => (document.getElementById(id)?.value || '').trim();
      const roles = Array.from(appForm.querySelectorAll('input[name="role"]:checked')).map(el => el.value);

      const required = ['name', 'cid', 'email', 'experience'];
      const missing = required.filter(id => !val(id));
      if (missing.length || roles.length === 0) {
        statusEl.textContent = 'Please fill in your name, CID, email, experience, and pick at least one role.';
        statusEl.className = 'form-status err';
        return;
      }

      const to = appForm.dataset.to || 'angusjones185@gmail.com';
      const subject = `VAIA Display Application — ${val('name')}`;
      const lines = [
        `Name: ${val('name')}`,
        `VATSIM CID: ${val('cid')}`,
        `Email: ${val('email')}`,
        `Discord: ${val('discord') || 'n/a'}`,
        `Simulator: ${val('simulator')}`,
        `Role(s) applying for: ${roles.join(', ')}`,
        `Formation / display experience:`,
        val('experience'),
        ``,
        `Availability:`,
        val('availability') || 'n/a',
        ``,
        `Additional notes:`,
        val('notes') || 'n/a',
      ];
      const body = lines.join('\n');
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      statusEl.textContent = 'Opening your email client to send the application…';
      statusEl.className = 'form-status ok';
      window.location.href = mailto;
    });
  }
});
