"""Keep the deliverable HTML self-contained after editing dashboard sources."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
page = root / 'index.html'
html = page.read_text()
for filename, tag in [('dashboard.css', 'style'), ('dashboard.js', 'script')]:
    start, end = f'<!-- BEGIN {filename} -->', f'<!-- END {filename} -->'
    content = f'{start}\n<{tag}>\n{(root / filename).read_text()}\n</{tag}>\n{end}'
    pattern = re.escape(start) + r'.*?' + re.escape(end)
    if start in html:
        html = re.sub(pattern, lambda _: content, html, flags=re.S)
    else:
        old = f'<link rel="stylesheet" href="{filename}">' if tag == 'style' else f'<script src="{filename}"></script>'
        if old not in html:
            raise RuntimeError(f'Missing embed point for {filename}')
        html = html.replace(old, content)
page.write_text(html)
