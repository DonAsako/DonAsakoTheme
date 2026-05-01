// DonAsako Theme JS
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Mobile menu toggle
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarItems = document.getElementById('navbarItems');

    if (navbarToggle && navbarItems) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            navbarItems.classList.toggle('active');
            document.body.style.overflow = navbarItems.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        navbarItems.querySelectorAll('.navbar-item--link').forEach(link => {
            link.addEventListener('click', function() {
                navbarToggle.classList.remove('active');
                navbarItems.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navbarItems.classList.contains('active')) {
                navbarToggle.classList.remove('active');
                navbarItems.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Code block topbar: language label + copy button.
    // Reads `language-foo` off the <code> element (set by the markdown
    // pipeline / highlight.js), wraps the <pre> in a frame and prepends
    // a bar. Skips already-wrapped pres so it stays idempotent.
    document.querySelectorAll('.markdown-body pre').forEach(function (pre) {
        if (pre.parentElement && pre.parentElement.classList.contains('code-block-frame')) return;
        const code = pre.querySelector('code');
        if (!code) return;

        let lang = '';
        for (const cls of code.classList) {
            if (cls.startsWith('language-')) { lang = cls.slice(9); break; }
        }

        const frame = document.createElement('div');
        frame.className = 'code-block-frame';

        const bar = document.createElement('div');
        bar.className = 'code-block-frame__bar';

        const langLabel = document.createElement('span');
        langLabel.className = 'code-block-frame__lang';
        langLabel.textContent = lang || 'text';

        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'code-block-frame__copy';
        copy.setAttribute('aria-label', 'Copy code');
        const defaultLabel = 'copy';
        copy.textContent = defaultLabel;
        copy.addEventListener('click', function () {
            const text = code.innerText;
            const done = function () {
                copy.classList.add('is-copied');
                copy.textContent = 'copied';
                setTimeout(function () {
                    copy.classList.remove('is-copied');
                    copy.textContent = defaultLabel;
                }, 1400);
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(done).catch(function () { /* ignore */ });
            } else {
                // Fallback for non-secure contexts (older browsers / http).
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); done(); } catch (_) {}
                document.body.removeChild(ta);
            }
        });

        bar.appendChild(langLabel);
        bar.appendChild(copy);

        pre.parentNode.insertBefore(frame, pre);
        frame.appendChild(bar);
        frame.appendChild(pre);
    });
});

