/* 一天到晚游泳的鱼 · 全站中英文切换
 * 三种用法：
 *   1. 大段内容：<div class="lang-block" lang="zh">…</div><div class="lang-block" lang="en">…</div>
 *   2. 行内短句：<span data-zh="中文" data-en="English"></span>
 *   3. 主题自带的界面文字（侧栏、导航、文章元信息等）：按下面 DICT 自动替换
 * 选择结果存 localStorage('site-lang')，未选择时跟随浏览器语言。
 * Hexo 源码位置：source/js/lang-toggle.js */
(function () {
  'use strict';

  // 中文界面文字 → 英文。值为数组表示 [中文显示, 英文显示]（用于源配置本身就是双语的菜单项）
  var DICT = {
    '首页 Home': ['首页', 'Home'],
    '归档 Archives': ['归档', 'Archives'],
    '简历 CV': ['简历', 'CV'],
    '论文 Publications': ['论文', 'Publications'],
    '关于 About': ['关于', 'About'],
    '标签 Tags': ['标签', 'Tags'],
    '分类 Categories': ['分类', 'Categories'],
    '统计 · 数学 · 记录与思考': 'Statistics · Mathematics · Notes & Thoughts',
    '文章': 'Posts',
    '标签': 'Tags',
    '分类': 'Categories',
    '公告': 'Notice',
    '最新文章': 'Recent Posts',
    '归档': 'Archives',
    '网站信息': 'Site Info',
    '文章数目 :': 'Posts :',
    '本站访客数 :': 'Visitors :',
    '本站总浏览量 :': 'Page Views :',
    '最后更新时间 :': 'Last Updated :',
    '专注统计学 Methodology、数学及相关技术探索': 'Statistical methodology, mathematics, and the tools around them',
    '发表于': 'Posted on',
    '更新于': 'Updated on',
    '浏览量:': 'Views:',
    '目录': 'Contents',
    '搜索': 'Search',
    '返回首页': 'Back to Home',
    '文章作者:': 'Author:',
    '文章链接:': 'Link:',
    '版权声明:': 'License:',
    '本博客所有文章除特别声明外，均采用': 'Unless otherwise noted, all posts on this blog are licensed under',
    '许可协议。转载请注明来源': '. Please credit the source when reposting.',
    '框架': 'Framework',
    '主题': 'Theme',
    '加载更多': 'Load more',
    '日间和夜间模式切换': 'Toggle light / dark mode',
    '单栏和双栏切换': 'Toggle sidebar',
    '设置': 'Settings',
    '回到顶部': 'Back to top'
  };
  var MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  var MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // 带数字的模式
  var PATTERNS = [
    [/^全部文章 - (\d+)$/, 'All Posts - $1'],
    [new RegExp('^(' + MONTHS.join('|') + ') (\\d{4})$'), function (m) {
      return MONTHS_EN[MONTHS.indexOf(m[1])] + ' ' + m[2];
    }]
  ];

  function translate(zh) {
    var t = zh.trim();
    if (!t) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, t)) return DICT[t];
    for (var i = 0; i < PATTERNS.length; i++) {
      var m = t.match(PATTERNS[i][0]);
      if (m) {
        var rep = PATTERNS[i][1];
        if (!rep) return null;
        return typeof rep === 'function' ? rep(m) : t.replace(PATTERNS[i][0], rep);
      }
    }
    return null;
  }

  // 收集需要替换的文本节点（跳过正文、脚本、语言块、标题链接）
  var SKIP = 'script,style,noscript,#article-container,.lang-block,.article-title,.post-title,#site-title,.site-name,.title,[data-zh],code,pre';
  var nodes = [];   // { node, zh, en }
  var attrs = [];   // { el, name, zh, en }
  function collect() {
    nodes.length = 0; attrs.length = 0;
    var roots = [document.getElementById('body-wrap'), document.getElementById('sidebar')];
    roots.forEach(function (root) {
      if (!root) return;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          var p = n.parentElement;
          return (p && p.closest(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      var n;
      while ((n = walker.nextNode())) {
        var r = translate(n.nodeValue);
        if (!r) continue;
        var raw = n.nodeValue;
        var lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
        var zh = Array.isArray(r) ? r[0] : raw.trim();
        var en = Array.isArray(r) ? r[1] : r;
        nodes.push({ node: n, zh: lead + zh + trail, en: lead + en + trail });
      }
      // title 属性（右下角按钮等）
      var titled = root.querySelectorAll('[title]');
      for (var i = 0; i < titled.length; i++) {
        var r2 = translate(titled[i].getAttribute('title'));
        if (r2 && !Array.isArray(r2)) attrs.push({ el: titled[i], name: 'title', zh: titled[i].getAttribute('title'), en: r2 });
      }
    });
  }

  function apply(lang) {
    var en = lang === 'en';
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.lang = en ? 'en' : 'zh-CN';
    nodes.forEach(function (it) { it.node.nodeValue = en ? it.en : it.zh; });
    attrs.forEach(function (it) { it.el.setAttribute(it.name, en ? it.en : it.zh); });
    // 行内双语
    var inline = document.querySelectorAll('[data-zh][data-en]');
    for (var i = 0; i < inline.length; i++) {
      inline[i].textContent = inline[i].getAttribute(en ? 'data-en' : 'data-zh');
    }
    // 大段内容块（CSS 已按 html[data-lang] 显隐，这里兼容旧写法）
    var blocks = document.querySelectorAll('.lang-block');
    for (var j = 0; j < blocks.length; j++) {
      blocks[j].style.display = blocks[j].getAttribute('lang') === lang ? '' : 'none';
    }
    // 页面内旧按钮（如有）
    var btns = document.querySelectorAll('.lang-switch button');
    for (var k = 0; k < btns.length; k++) btns[k].classList.toggle('active', btns[k].dataset.lang === lang);
    document.dispatchEvent(new CustomEvent('site-lang-change', { detail: { lang: lang } }));
  }

  function getLang() {
    var saved = null;
    try { saved = localStorage.getItem('site-lang'); } catch (e) { /* 隐私模式 */ }
    if (saved === 'zh' || saved === 'en') return saved;
    var nav = (navigator.language || '').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  window.setLang = function (lang) {
    if (lang !== 'zh' && lang !== 'en') lang = 'zh';
    try { localStorage.setItem('site-lang', lang); } catch (e) { /* ignore */ }
    apply(lang);
  };
  window.getLang = getLang;
  window.toggleLang = function () { window.setLang(getLang() === 'zh' ? 'en' : 'zh'); };

  function init() {
    collect();
    apply(getLang());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
