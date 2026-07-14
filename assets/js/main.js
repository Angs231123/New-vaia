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
});
