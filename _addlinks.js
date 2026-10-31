const fs = require('fs');
const path = require('path');

const root = 'd:/projects/Cursor/mosaic';

const links = [
  ['视频去水印字幕工具', 'https://www.removewatermarker.com/'],
  ['在线文字转字幕AI工具', 'https://www.chdaoai.com/zh/text-to-subtitles'],
  ['传道PDF图片条码工具', 'https://www.openai2025.com/'],
  ['在线base64工具', 'https://www.base64.club/'],
  ['NBA趣事', 'https://www.zorezoro.com/'],
  ['在线免费游戏', 'https://www.icebreakgame.com/'],
  ['中国菜系大全', 'https://food.zorezoro.com/'],
  ['中国功夫大全', 'https://gf.zorezoro.com/'],
  ['中国24史', 'https://china.zorezoro.com/'],
];

const linksEn = [
  ['Video Watermark & Subtitle Tool', 'https://www.removewatermarker.com/'],
  ['Online Text to Subtitle AI Tool', 'https://www.chdaoai.com/zh/text-to-subtitles'],
  ['ChuanDao PDF Image Barcode Tool', 'https://www.openai2025.com/'],
  ['Online Base64 Tool', 'https://www.base64.club/'],
  ['NBA Fun Stuff', 'https://www.zorezoro.com/'],
  ['Free Online Games', 'https://www.icebreakgame.com/'],
  ['Chinese Cuisine Collection', 'https://food.zorezoro.com/'],
  ['Chinese Kung Fu Collection', 'https://gf.zorezoro.com/'],
  ['China 24 Histories', 'https://china.zorezoro.com/'],
];

function buildBlock(items, prefix, indent) {
  const ext = items.map(([t, u]) =>
    `                    <a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`);
  const int = [
    `                    <a href="${prefix}rotate/rotate.html">图片旋转工具</a>`,
    `                    <a href="${prefix}exif/exif.html">查看照片EXIF</a>`,
  ];
  const all = ext.concat(int);
  return [
    `${indent}<!-- 友情链接 -->`,
    `${indent}<div class="friendship-links">`,
    `${indent}    <h3>友情链接</h3>`,
    `${indent}    <div class="links-grid">`,
    ...all,
    `${indent}    </div>`,
    `${indent}</div>`,
    '',
  ].join('\n');
}

function buildBlockEn(items, prefix, indent) {
  const ext = items.map(([t, u]) =>
    `                    <a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`);
  const int = [
    `                    <a href="${prefix}rotate/rotate.html">Image Rotate Tool</a>`,
    `                    <a href="${prefix}exif/exif.html">View Photo EXIF</a>`,
  ];
  const all = ext.concat(int);
  return [
    `${indent}<!-- Friendly links -->`,
    `${indent}<div class="friendship-links">`,
    `${indent}    <h3>Friendly Links</h3>`,
    `${indent}    <div class="links-grid">`,
    ...all,
    `${indent}    </div>`,
    `${indent}</div>`,
    '',
  ].join('\n');
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(root, []);
let changed = [];

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.length < 500) continue; // skip verification stub
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const depth = rel.split('/').length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : '';
  const isEn = path.basename(file) === 'index-en.html';
  const block = isEn
    ? buildBlockEn(linksEn, prefix, '            ')
    : buildBlock(links, prefix, '            ');

  if (html.includes('friendship-links')) {
    // replace existing block (index.html)
    const start = html.indexOf('<!-- 友情链接 -->');
    const endMark = html.indexOf('<!-- 版权信息 -->', start);
    if (start !== -1 && endMark !== -1) {
      html = html.slice(0, start) + block + html.slice(endMark);
    } else {
      const s2 = html.indexOf('<div class="friendship-links">');
      const e2 = html.indexOf('<!-- 版权信息 -->', s2);
      html = html.slice(0, s2) + block.replace(/<!-- 友情链接 -->\n/, '') + html.slice(e2);
    }
  } else if (html.includes('<div class="footer-bottom">')) {
    html = html.replace('<div class="footer-bottom">', block + '            <div class="footer-bottom">');
  } else if (isEn) {
    // no footer on english index: add a simple footer before </body>
    const footer = [
      '    <footer class="site-footer">',
      '        <div class="footer-container">',
      '            <div class="friendship-links">',
      '                <h3>Friendly Links</h3>',
      '                <div class="links-grid">',
      ...linksEn.map(([t, u]) => `                    <a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`),
      `                    <a href="${prefix}rotate/rotate.html">Image Rotate Tool</a>`,
      `                    <a href="${prefix}exif/exif.html">View Photo EXIF</a>`,
      '                </div>',
      '            </div>',
      '            <div class="footer-bottom">',
      '                <p>Copyright &copy; ChuanDao AI. All rights reserved.</p>',
      '            </div>',
      '        </div>',
      '    </footer>',
      '',
    ].join('\n');
    html = html.replace('</body>', footer + '</body>');
  } else {
    continue;
  }

  fs.writeFileSync(file, html, 'utf8');
  changed.push(rel);
}

console.log('updated ' + changed.length + ' files:');
changed.forEach(c => console.log(' - ' + c));
