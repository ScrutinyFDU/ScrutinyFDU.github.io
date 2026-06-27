function setLang(lang) {
  document.querySelectorAll('.lang-block').forEach(el => {
    el.style.display = el.getAttribute('lang') === lang ? '' : 'none';
  });
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  localStorage.setItem('site-lang', lang);
}
document.addEventListener('DOMContentLoaded', () => {
  setLang(localStorage.getItem('site-lang') || 'zh');
});