// script.js
document.addEventListener('DOMContentLoaded', () => {
    const articlesContainer = document.getElementById('articles-container');

    // 确保 articles 数组已定义且不为空
    if (typeof articles !== 'undefined' && articles.length > 0) {
        // 按日期降序排序文章，最新的在前
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        articles.forEach(article => {
            const articleItem = document.createElement('div');
            articleItem.classList.add('article-item');

            articleItem.innerHTML = `
                <h3><a href="${article.filename}">${article.title}</a></h3>
                <div class="article-meta">
                    <span>发布日期: ${article.date}</span>
                </div>
                <p class="article-summary">${article.summary}</p>
            `;
            articlesContainer.appendChild(articleItem);
        });
    } else {
        articlesContainer.innerHTML = '<p>暂无文章可显示。</p>';
    }
});
