/**
 * SVG 원본(icon.svg, og.svg) → 필요한 해상도별 PNG 생성
 * 실행: cd scripts/icons && npm install && npm run build
 * 결과물은 프로젝트 루트(`/`)의 assets/ 폴더가 아닌 루트에 직접 씀 (HTML에서 상대경로로 참조)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const ROOT = path.resolve(HERE, '..', '..');

const iconSvg = fs.readFileSync(path.join(HERE, 'icon.svg'));
const ogSvg = fs.readFileSync(path.join(HERE, 'og.svg'));

const targets = [
  // 파비콘
  { src: iconSvg, size: 16, out: 'favicon-16.png' },
  { src: iconSvg, size: 32, out: 'favicon-32.png' },
  // Apple 홈 화면
  { src: iconSvg, size: 180, out: 'apple-touch-icon.png' },
  // Android / PWA
  { src: iconSvg, size: 192, out: 'icon-192.png' },
  { src: iconSvg, size: 512, out: 'icon-512.png' },
  // OG 이미지 (1200x630 원본 비율 그대로)
  { src: ogSvg, width: 1200, height: 630, out: 'og-image.png' },
];

(async () => {
  for (const t of targets) {
    const pipeline = sharp(t.src, { density: 384 });
    if (t.size) pipeline.resize(t.size, t.size);
    else pipeline.resize(t.width, t.height);
    const outPath = path.join(ROOT, t.out);
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
    const stat = fs.statSync(outPath);
    console.log(`✓ ${t.out}  ${(stat.size / 1024).toFixed(1)} KB`);
  }
})();
