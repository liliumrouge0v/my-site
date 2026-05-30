// 把 SSR 渲染的各页面拼成一个可离线查看的静态 HTML(手机文件预览也能看)。
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { renderSections } from '../dist-ssr/ssr.js'

// 读取编译后的 Tailwind CSS
const assetsDir = new URL('../dist/assets/', import.meta.url)
const cssFile = readdirSync(assetsDir).find((f) => f.endsWith('.css'))
const css = readFileSync(new URL(cssFile, assetsDir), 'utf8')

const sections = renderSections()

const body = sections
  .map(
    (s) => `
    <div class="sec-title">${s.title}</div>
    <div class="static-preview">${s.html}</div>`,
  )
  .join('\n')

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>生活记录 · 静态预览</title>
<style>${css}</style>
<style>
  body { background:#eef1f5; }
  /* 静态预览:把 fixed/sticky 还原为正常流,避免多页叠加 */
  .static-preview .fixed, .static-preview .sticky { position: static !important; }
  .static-preview { background:#f8fafc; border-radius:18px; overflow:hidden;
    margin:0 auto 28px; max-width:860px; box-shadow:0 6px 24px rgba(15,23,42,.08); }
  .sec-title { max-width:860px; margin:28px auto 10px; padding:0 6px;
    font-weight:700; color:#475569; font-size:15px; }
  .top-note { max-width:860px; margin:0 auto; padding:14px 16px; color:#92400e;
    background:#fffbeb; border:1px solid #fde68a; border-radius:12px; font-size:13px; }
  .wrap { padding:20px 14px 40px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="top-note">📄 这是<strong>静态预览</strong>(把界面直接印进了网页,方便手机查看)。它<strong>不可点击交互</strong>,只展示外观与示例数据。要体验真实交互,请在<strong>电脑浏览器</strong>打开「生活记录-预览.html」,或部署后用手机浏览器访问。</div>
  ${body}
</div>
</body>
</html>`

writeFileSync(new URL('../生活记录-手机预览.html', import.meta.url), html)
console.log('已生成 生活记录-手机预览.html (%d KB)', Math.round(html.length / 1024))
