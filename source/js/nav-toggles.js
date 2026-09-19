/* 一天到晚游泳的鱼 · 导航栏右侧的两个按钮：夜间模式 / 中英文
 * 夜间模式复用 Butterfly 自带的 #darkmode 逻辑（含 localStorage 记忆）；
 * 语言切换调用 lang-toggle.js 暴露的 window.toggleLang()。
 * Hexo 源码位置：source/js/nav-toggles.js */
(function () {
  'use strict';

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function build() {
    var menus = document.getElementById('menus');
    if (!menus || document.querySelector('#nav .nav-extra')) return;

    var wrap = document.createElement('span');
    wrap.className = 'nav-extra';

    // —— 夜间模式 ——
    var dark = document.createElement('button');
    dark.type = 'button';
    dark.id = 'nav-darkmode';
    dark.setAttribute('aria-label', 'Toggle dark mode');
    dark.innerHTML = '<i class="fas fa-moon"></i>';
    dark.addEventListener('click', function () {
      var builtin = document.getElementById('darkmode');
      if (builtin) {
        builtin.click();               // 走主题自带逻辑（保存偏好 + 触发主题事件）
      } else if (window.btf) {         // 兜底
        var next = isDark() ? 'light' : 'dark';
        next === 'dark' ? btf.activateDarkMode() : btf.activateLightMode();
        btf.saveToLocal.set('theme', next, 2);
      }
    });

    // —— 中英文 ——
    var lang = document.createElement('button');
    lang.type = 'button';
    lang.id = 'nav-lang';
    lang.setAttribute('aria-label', 'Switch language');
    lang.addEventListener('click', function () {
      if (window.toggleLang) window.toggleLang();
    });

    wrap.appendChild(dark);
    wrap.appendChild(lang);
    var toggleMenu = document.getElementById('toggle-menu');
    toggleMenu ? menus.insertBefore(wrap, toggleMenu) : menus.appendChild(wrap);

    function syncDark() {
      var d = isDark();
      dark.innerHTML = d ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      dark.title = document.documentElement.getAttribute('data-lang') === 'en'
        ? (d ? 'Switch to light mode' : 'Switch to dark mode')
        : (d ? '切换到日间模式' : '切换到夜间模式');
    }
    function syncLang() {
      var en = document.documentElement.getAttribute('data-lang') === 'en';
      lang.textContent = en ? '中' : 'EN';   // 显示"切换后"的语言
      lang.title = en ? '切换到中文' : 'Switch to English';
      syncDark();
    }
    syncLang();

    if (window.MutationObserver) {
      new MutationObserver(syncDark)
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
    document.addEventListener('site-lang-change', syncLang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
