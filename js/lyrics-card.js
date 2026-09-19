/* 一天到晚游泳的鱼 · 文章底部随机歌词方块
 * 数据在 lyrics-data.js（window.LYRICS）。默认只在文章页显示；
 * 想让「关于 / CV」等独立页面也显示，把 showOnPages 改成 true。
 * Hexo 源码位置：source/js/lyrics-card.js */
(function () {
  'use strict';

  var CONFIG = {
    showOnPosts: true,
    showOnPages: false,
    label: { zh: '随机歌词', en: 'Random lyric' },
    shuffle: { zh: '换一首', en: 'Shuffle' }
  };

  function currentLang() {
    return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
  }

  function pick(exclude) {
    var list = window.LYRICS || [];
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    var pool = [];
    list.forEach(function (s) {
      if (s === exclude) return;
      var w = Math.max(1, s.weight || 1);
      for (var i = 0; i < w; i++) pool.push(s);
    });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function build() {
    var host = document.getElementById('article-container');
    if (!host || document.querySelector('.lyric-card')) return;
    var isPost = !!document.getElementById('post');
    if (isPost ? !CONFIG.showOnPosts : !CONFIG.showOnPages) return;

    var song = pick(null);
    if (!song) return;

    var card = document.createElement('div');
    card.className = 'lyric-card';

    function render() {
      var lang = currentLang();
      card.innerHTML =
        '<div class="lyric-card-head">' +
          '<span class="lyric-card-label"><i class="fas fa-music"></i> ' + esc(CONFIG.label[lang]) + '</span>' +
          '<button type="button" class="lyric-card-shuffle" title="' + esc(CONFIG.shuffle[lang]) + '">' +
            '<i class="fas fa-random"></i></button>' +
        '</div>' +
        '<div class="lyric-card-lines">' + song.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>' +
        '<div class="lyric-card-meta">—— 《' + esc(song.title) + '》' + esc(song.artist) + '</div>';
      card.querySelector('.lyric-card-shuffle').addEventListener('click', function () {
        song = pick(song);
        card.classList.add('is-switching');
        setTimeout(function () { render(); card.classList.remove('is-switching'); }, 180);
      });
    }
    render();
    document.addEventListener('site-lang-change', render);

    // 放在正文之后、版权声明之前
    host.insertAdjacentElement('afterend', card);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
