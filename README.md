# 一天到晚游泳的鱼 · Hexo 源码

博客 https://scrutinyfdu.github.io 的 Hexo 7 + Butterfly 源码。生成产物在同名仓库的 `main` 分支。

## 日常使用

```bash
npm install            # 第一次 clone 后
npx hexo new "文章标题"  # 新建文章 → source/_posts/
npx hexo server        # 本地预览 http://localhost:4000
npx hexo clean && npx hexo deploy   # 生成并推送到 GitHub Pages
```

## 自定义文件（不在主题里）

| 文件 | 作用 |
|---|---|
| `source/css/ocean.css` | 海洋背景、banner、导航按钮、副标题、歌词方块样式 |
| `source/js/ocean-fish-bg.js` | 全屏游鱼 + 气泡（`CONFIG` 里改数量/速度） |
| `source/js/lang-toggle.js` | 全站中英文切换（`DICT` 里加界面文字翻译） |
| `source/js/nav-toggles.js` | 导航栏 夜间模式 / 中英文 按钮 |
| `source/js/lyrics-data.js` | **随机歌词库，加歌改这里** |
| `source/js/lyrics-card.js` | 文章底部歌词方块 |

引用方式在 `_config.butterfly.yml` 的 `inject:` 段。

## 写双语内容

```html
<div lang="zh" class="lang-block">

中文内容（前后各留一个空行，Markdown 才会渲染）

</div>
<div lang="en" class="lang-block">

English content

</div>
```
