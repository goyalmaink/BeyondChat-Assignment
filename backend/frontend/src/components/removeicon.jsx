export function extractTextFromHTML(html) {
    if (!html) return "";
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.querySelectorAll('script, style').forEach(n => n.remove());
        return doc.body.textContent.trim().replace(/\s+/g, ' ');
    } catch (e) {
        return html.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    }
}

export default function cleanArticleContent(html) {
    if (!html) return "";

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const removeSelectors = [
            'iframe', 'svg', 'script', 'style', 'noscript', 'form', 'aside', '.share', '.social', '.author', '.post-meta', '.comments', '.subscribe', '.newsletter'
        ];

        removeSelectors.forEach(sel => {
            doc.querySelectorAll(sel).forEach(node => node.remove());
        });

        doc.querySelectorAll('a').forEach(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            if (/twitter|linkedin|facebook|x\.com|instagram|youtube|mailto:/i.test(href)) {
                a.remove();
                return;
            }
            // ensure external links open in new tab safely
            if (href && !href.startsWith('/') && !href.includes(window.location.hostname)) {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            }
        });

        doc.querySelectorAll('*').forEach(el => {
            [...el.attributes].forEach(attr => {
                if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
            });
            if (el.hasAttribute('style')) el.removeAttribute('style');
            if (el.tagName === 'IMG') {
                el.removeAttribute('width');
                el.removeAttribute('height');
            }
        });

        doc.querySelectorAll('img').forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.classList.add('rounded-lg', 'mx-auto', 'my-6');
            img.style.maxHeight = '420px';
            img.style.objectFit = 'contain';
        });

        const wrapTextNodes = (parent) => {
            const children = Array.from(parent.childNodes);
            let buffer = [];

            const flush = () => {
                if (buffer.length === 0) return;
                const p = doc.createElement('p');
                buffer.forEach(n => p.appendChild(n));
                parent.insertBefore(p, buffer[0] || null);
                buffer = [];
            };

            children.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent.trim() !== '') {
                        buffer.push(node);
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE && ['P', 'H1', 'H2', 'H3', 'H4', 'UL', 'OL', 'BLOCKQUOTE', 'TABLE', 'FIGURE'].includes(node.tagName)) {
                    flush();
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    flush();
                }
            });
            flush();
        };

        wrapTextNodes(doc.body);

        doc.querySelectorAll('p').forEach(p => {
            if (/^[-*]{3,}$/.test(p.textContent.trim())) {
                const hr = doc.createElement('hr');
                p.replaceWith(hr);
            }
        });

        doc.querySelectorAll('p').forEach(p => {
            const text = p.textContent.trim();
            const match = text.match(/^“(.+)”$/);
            if (match) {
                const bq = doc.createElement('blockquote');
                bq.textContent = match[1];
                p.replaceWith(bq);
            }
        });

        doc.querySelectorAll('p').forEach(p => {
            const t = p.textContent.trim();
            if (t.length > 0 && (t === t.toUpperCase() && t.split(' ').length < 10 || /:$/.test(t))) {
                const h2 = doc.createElement('h2');
                h2.textContent = t;
                p.replaceWith(h2);
            }
        });

        return doc.body.innerHTML;

    } catch (e) {
        let content = html || '';
        content = content.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
        content = content.replace(/<svg[\s\S]*?<\/svg>/gi, '');
        content = content.replace(/<a[^>]*href="[^"]*(twitter|linkedin|facebook|x\.com)[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
        content = content.replace(/-{3,}/g, '<hr />');
        content = `<p>${content}</p>`;
        return content;
    }
}
