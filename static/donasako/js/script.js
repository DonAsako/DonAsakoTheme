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
    //
    // Language detection is intentionally permissive — different markdown
    // pipelines emit different markup (codehilite drops the language
    // entirely, fenced_code uses `language-X`, some plugins use `lang-X`,
    // hljs auto-detect adds `language-X` after the fact, etc). We try
    // every spot we know of, then fall back to inspecting hljs's first-token
    // marker. If nothing is found we omit the label rather than displaying
    // a misleading "text".
    const LANG_ALIASES = {
        py: 'python', js: 'javascript', ts: 'typescript', rs: 'rust',
        sh: 'bash', shell: 'bash', zsh: 'bash',
        'c++': 'cpp', cs: 'csharp', kt: 'kotlin', rb: 'ruby',
        yml: 'yaml', md: 'markdown', ps1: 'powershell', ps: 'powershell',
        dockerfile: 'docker', make: 'makefile', plaintext: '', txt: '', text: ''
    };
    const KNOWN_LANGS = new Set([
        'python', 'javascript', 'typescript', 'jsx', 'tsx',
        'bash', 'sh', 'zsh', 'fish', 'powershell', 'cmd', 'batch',
        'c', 'cpp', 'csharp', 'java', 'kotlin', 'scala', 'groovy',
        'go', 'rust', 'zig', 'swift', 'objectivec', 'dart',
        'ruby', 'php', 'perl', 'lua', 'r', 'julia', 'haskell',
        'elixir', 'erlang', 'clojure', 'fsharp', 'ocaml', 'nim', 'crystal',
        'html', 'css', 'scss', 'sass', 'less',
        'json', 'jsonc', 'xml', 'yaml', 'toml', 'ini', 'env',
        'sql', 'graphql', 'protobuf', 'thrift',
        'docker', 'dockerfile', 'makefile', 'nginx', 'apache',
        'diff', 'patch', 'asm', 'x86asm', 'arm', 'mips',
        'http', 'vim', 'lisp', 'scheme', 'matlab', 'verilog', 'vhdl',
        'tex', 'latex', 'markdown'
    ]);

    function normalize(raw) {
        if (!raw) return '';
        const k = raw.toLowerCase();
        if (k in LANG_ALIASES) return LANG_ALIASES[k];
        return k;
    }

    function detectLanguage(pre, code) {
        const sources = [code, pre, pre.parentElement].filter(Boolean);

        // 1. language-X / lang-X explicit prefix
        for (const el of sources) {
            for (const cls of el.classList) {
                if (cls.startsWith('language-')) return normalize(cls.slice(9));
                if (cls.startsWith('lang-'))     return normalize(cls.slice(5));
            }
        }

        // 2. data-language="X" (some renderers)
        for (const el of sources) {
            const d = el.getAttribute && el.getAttribute('data-language');
            if (d) return normalize(d);
        }

        // 3. Bare class that matches a known language alias
        for (const el of sources) {
            for (const cls of el.classList) {
                if (cls === 'hljs' || cls === 'highlight' || cls === 'codehilite') continue;
                const norm = normalize(cls);
                if (norm && KNOWN_LANGS.has(norm)) return norm;
            }
        }

        return '';
    }

    document.querySelectorAll('.markdown-body pre').forEach(function (pre) {
        if (pre.parentElement && pre.parentElement.classList.contains('code-block-frame')) return;
        const code = pre.querySelector('code');
        if (!code) return;

        const lang = detectLanguage(pre, code);

        const frame = document.createElement('div');
        frame.className = 'code-block-frame';

        const bar = document.createElement('div');
        bar.className = 'code-block-frame__bar';
        if (!lang) bar.classList.add('code-block-frame__bar--no-lang');

        if (lang) {
            const langLabel = document.createElement('span');
            langLabel.className = 'code-block-frame__lang';
            langLabel.textContent = lang;
            bar.appendChild(langLabel);
        }

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
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); done(); } catch (_) {}
                document.body.removeChild(ta);
            }
        });

        bar.appendChild(copy);

        pre.parentNode.insertBefore(frame, pre);
        frame.appendChild(bar);
        frame.appendChild(pre);
    });

    // Heading anchors. For h2-h4 inside .markdown-body, give each an
    // ID (idempotent — leaves existing IDs alone) and prepend a
    // `<a class="heading-anchor">#</a>`. The CSS keeps it invisible
    // until the heading is hovered. Click copies the full URL with
    // the fragment to the clipboard.
    function slugify(text) {
        return (text || '')
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    document.querySelectorAll('.markdown-body h2, .markdown-body h3, .markdown-body h4').forEach(function (h, i) {
        if (h.querySelector('.heading-anchor')) return;
        if (!h.id) {
            const text = h.textContent || '';
            h.id = slugify(text) || ('heading-' + i);
        }
        const a = document.createElement('a');
        a.className = 'heading-anchor';
        a.href = '#' + h.id;
        a.setAttribute('aria-label', 'Permalink');
        // No textContent: the visual "#" is rendered by the CSS ::before
        // pseudo so it doesn't pollute heading.textContent (which the
        // TOC reads to label its entries).
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const url = window.location.origin + window.location.pathname + '#' + h.id;
            const flash = function () {
                a.classList.add('is-copied');
                setTimeout(function () { a.classList.remove('is-copied'); }, 1100);
            };
            // Update the URL hash without scroll-jumping (smooth handled by sibling listener if needed)
            history.replaceState(null, '', '#' + h.id);
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url).then(flash).catch(flash);
            } else {
                const ta = document.createElement('textarea');
                ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); } catch (_) {}
                document.body.removeChild(ta);
                flash();
            }
        });
        h.appendChild(a);
    });
});

