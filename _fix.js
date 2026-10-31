const fs = require('fs');
const path = require('path');
const root = 'd:/projects/Cursor/mosaic';

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

for (const file of walk(root, [])) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.length < 500) continue;
  const before = s;
  s = s.replace(/\n\s*<!-- 友情链接 -->\n(\s*)<div class="friendship-links">/, '\n            <!-- 友情链接 -->\n$1<div class="friendship-links">');
  s = s.replace(/\n\s*<!-- 版权信息 -->\n/, '\n            <!-- 版权信息 -->\n');
  if (s !== before) fs.writeFileSync(file, s, 'utf8');
}

// shared styles in css.css
const cssPath = path.join(root, 'css.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('.friendship-links')) {
  const addition = `
/* 友情链接 */
.friendship-links {
    text-align: center;
    margin-bottom: 30px;
    padding: 0 20px;
}

.friendship-links h3 {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 20px;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    max-width: 1000px;
    margin: 0 auto;
}

.links-grid a {
    display: inline;
    text-decoration: underline;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    margin: 0 15px 10px 0;
    transition: color 0.3s ease;
}

.links-grid a:hover {
    color: #007bff;
}

@media (max-width: 768px) {
    .links-grid a {
        margin: 0 10px 8px 0;
        font-size: 15px;
    }

    .friendship-links {
        padding: 0 15px;
    }
}
`;
  const anchor = `.footer-bottom {
    text-align: center;
    padding-top: 30px;`;
  if (css.includes(anchor)) {
    css = css.replace(anchor, addition.trimStart() + '\n' + anchor);
  } else {
    css += addition;
  }
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('css.css updated');
}
