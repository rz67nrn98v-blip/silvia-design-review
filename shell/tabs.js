const ICONS = {
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
  money: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  pay: '<circle cx="9" cy="10" r="3"/><circle cx="16" cy="10" r="3"/><path d="M3 19c0-2.5 2.5-4 6-4s6 1.5 6 4"/><path d="M13 19c.3-2 2.2-3.2 5-3.2 1.2 0 2.2.3 3 .8"/>',
  decide: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9 12h6"/>',
  portfolio: '<path d="M4 19V5h4l3 7 3-7h4v14"/><path d="M4 15h16"/>',
  ask: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
};
const LABELS = {
  home: 'Home',
  money: 'Money',
  pay: 'Pay',
  decide: 'Decide',
  portfolio: 'Portfolio',
  ask: 'Ask',
};
document.querySelectorAll('nav.tabs').forEach((nav) => {
  const active = nav.dataset.active || 'home';
  // migrate old peer active → pay
  const key = active === 'peer' ? 'pay' : active;
  nav.dataset.active = key;
  nav.innerHTML = Object.keys(LABELS).map((k) => {
    const on = k === key ? ' active' : '';
    return `<div class="tab${on}"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${ICONS[k]}</svg></span>${LABELS[k]}</div>`;
  }).join('');
});
