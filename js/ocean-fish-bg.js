/* 一天到晚游泳的鱼 · 全屏游鱼背景 (无依赖 / Canvas)
 * 关闭方式：把下面 enabled 改成 false，或直接删掉 inject 里的引用行。 */
(function () {
  'use strict';

  var CONFIG = {
    enabled: true,                 // ← 一键开关
    countDesktop: 7,               // 桌面鱼数 (5~8)
    countMobile: 4,                // 移动端鱼数
    colors: ['#3aa0d8', '#4fc3dc', '#2b7bb9', '#6fd0e0', '#1f6f9c', '#5bc0d0'],
    cruise: 0.55,                  // 巡航速度 px/帧 (慢慢游)
    maxSpeed: 4.2,                 // 被惊吓时最高速度
    repelRadius: 140,              // 鼠标排斥半径
    repelForce: 0.9,               // 排斥强度
    bg: 'rgba(0,0,0,0)'            // 画布透明，露出主题背景
  };

  if (!CONFIG.enabled || window.__OCEAN_FISH__) return;
  window.__OCEAN_FISH__ = true;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = window.matchMedia &&
    window.matchMedia('(hover: none)').matches;
  var isMobile = window.matchMedia &&
    window.matchMedia('(max-width: 768px)').matches;

  // —— 画布：固定全屏、最底层、不挡点击 ——
  var canvas = document.createElement('canvas');
  canvas.id = 'ocean-fish-bg';
  var s = canvas.style;
  s.position = 'fixed'; s.top = '0'; s.left = '0';
  s.width = '100%'; s.height = '100%';
  s.zIndex = '-1';               // 负值，沉到内容底下
  s.pointerEvents = 'none';      // 不拦截点击
  (document.body || document.documentElement).appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  var W = 0, H = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // resize 后把越界的鱼夹回可视区
    for (var i = 0; i < fish.length; i++) {
      fish[i].x = Math.min(Math.max(fish[i].x, 0), W);
      fish[i].y = Math.min(Math.max(fish[i].y, 0), H);
    }
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  // —— 初始化鱼群 ——
  var fish = [];
  function makeFish() {
    fish.length = 0;
    var n = isMobile ? CONFIG.countMobile : CONFIG.countDesktop;
    for (var i = 0; i < n; i++) {
      var ang = rand(0, Math.PI * 2);
      fish.push({
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        vx: Math.cos(ang) * CONFIG.cruise,
        vy: Math.sin(ang) * CONFIG.cruise,
        size: rand(10, 17) * (isMobile ? 0.85 : 1),
        color: CONFIG.colors[i % CONFIG.colors.length],
        phase: rand(0, Math.PI * 2)
      });
    }
  }
  makeFish();
  resize();

  // —— 鼠标（平滑跟踪）——
  var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
  if (!noHover) {
    window.addEventListener('pointermove', function (e) {
      mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', function () { mouse.active = false; });
  }

  // —— 绘制单条鱼 ——
  function drawFish(f) {
    var ang = Math.atan2(f.vy, f.vx);
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(ang);
    ctx.fillStyle = f.color;
    ctx.globalAlpha = 0.85;
    // 身体
    ctx.beginPath();
    ctx.ellipse(0, 0, f.size, f.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    // 摆动的尾巴
    var wag = Math.sin(f.phase) * f.size * 0.45;
    ctx.beginPath();
    ctx.moveTo(-f.size * 0.85, 0);
    ctx.lineTo(-f.size * 1.5, wag - f.size * 0.4);
    ctx.lineTo(-f.size * 1.5, wag + f.size * 0.4);
    ctx.closePath();
    ctx.fill();
    // 眼睛
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#0a3a52';
    ctx.beginPath();
    ctx.arc(f.size * 0.55, -f.size * 0.12, f.size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function update(dt) {
    // 鼠标平滑插值，避免快速划过给鱼瞬时大冲量（防抖动）
    if (mouse.active) {
      mouse.x += (mouse.tx - mouse.x) * 0.2;
      mouse.y += (mouse.ty - mouse.y) * 0.2;
    }
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];
      // 1. 游动扰动：缓慢旋转速度向量
      var wa = (Math.random() - 0.5) * 0.06;
      var c = Math.cos(wa), sn = Math.sin(wa);
      var nvx = f.vx * c - f.vy * sn;
      var nvy = f.vx * sn + f.vy * c;
      f.vx = nvx; f.vy = nvy;
      // 2. 鼠标排斥：距离越近力越大，边缘趋近 0（平滑散开）
      if (mouse.active) {
        var dx = f.x - mouse.x, dy = f.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < CONFIG.repelRadius) {
          var force = (1 - d / CONFIG.repelRadius) * CONFIG.repelForce;
          f.vx += (dx / d) * force;
          f.vy += (dy / d) * force;
        }
      }
      // 3. 速度收敛回巡航速度（鼠标离开后自己滑回常速，不急停）
      var sp = Math.sqrt(f.vx * f.vx + f.vy * f.vy) || 0.0001;
      var target = sp + (CONFIG.cruise - sp) * 0.05;
      if (target > CONFIG.maxSpeed) target = CONFIG.maxSpeed;
      if (target < CONFIG.cruise * 0.8) target = CONFIG.cruise * 0.8;
      var k = target / sp;
      f.vx *= k; f.vy *= k;
      // 4. 移动（帧率无关）
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.phase += (0.12 + sp * 0.04) * dt;
      // 5. 边界回绕
      var m = f.size * 1.6;
      if (f.x < -m) f.x = W + m; else if (f.x > W + m) f.x = -m;
      if (f.y < -m) f.y = H + m; else if (f.y > H + m) f.y = -m;
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    if (CONFIG.bg && CONFIG.bg !== 'rgba(0,0,0,0)') {
      ctx.fillStyle = CONFIG.bg; ctx.fillRect(0, 0, W, H);
    }
    for (var i = 0; i < fish.length; i++) drawFish(fish[i]);
  }

  // —— 主循环（含离屏暂停）——
  var raf = null, last = 0;
  function loop(now) {
    var dt = (now - last) / 16.67;
    if (dt > 2) dt = 2;          // 切回标签页防瞬移
    last = now;
    update(dt);
    render();
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  // resize（去抖）
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      isMobile = window.innerWidth <= 768;
      resize();
    }, 200);
  }, { passive: true });

  // 离屏 / 切标签页 → 暂停
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (!reduceMotion) start();
  });

  // —— 启动 ——
  if (reduceMotion) {
    render();                    // 只画静态一帧，绝不启动动画
  } else {
    start();
  }
})();