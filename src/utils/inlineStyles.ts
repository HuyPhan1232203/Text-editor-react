export function inlineStyles (html: string): string {
  const styleSheet = `
  <style>
    /* --- Base giống index.css --- */
    body {
      font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000;
      margin: 0;
      padding: 0;
      background: transparent;
    }

    p {
      color: #000;
      margin: 0;
      line-height: 1.5;
      font-size: 11pt;
      /* quan trọng: cho phép wrap trong print */
      white-space: normal;
      min-height: 1em;
    }

    /* --- WRAP/BREAK an toàn khi in --- */
    /* 1) Cho phép bẻ dòng khi text quá dài (kể cả từ dài/URL) */
    body, p, li, blockquote, a, td, th {
      overflow-wrap: anywhere;
      word-break: break-word;
      hyphens: auto;
    }

    /* 2) Nếu nội dung có newline dạng text (\\n) cần hiển thị như xuống dòng
          (chỉ dùng khi HTML output của bạn thực sự chứa newline trong text node) */
    .tiptap, .tiptap-editor-content {
      white-space: normal;
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.3;
      font-weight: 700;
      margin: 12pt 0 6pt 0;
      color: #000;
      font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
      page-break-after: avoid;
      break-after: avoid;
    }

    h1 { font-size: 26pt; }
    h2 { font-size: 19pt; }
    h3 { font-size: 14pt; }
    h4 { font-size: 13pt; }
    h5 { font-size: 12pt; }
    h6 { font-size: 11pt; }

    ul, ol { padding-left: 36pt; margin: 6pt 0; color: #000; }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }

    li { margin: 3pt 0; padding-left: 6pt; }
    li > p { margin: 0; line-height: 1.5; }

    code {
      background: #f2f2f2;
      color: #000;
      padding: 2px 4px;
      border-radius: 2px;
      font-size: 10pt;
      font-family: 'Courier New', monospace;
      /* code dài cũng cần wrap khi in */
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    pre {
      background: #f2f2f2;
      border: 1px solid #d0d0d0;
      padding: 8px;
      border-radius: 2px;
      overflow-x: auto;
      margin: 12pt 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    pre code { background: transparent; padding: 0; }

    blockquote {
      border-left: 4pt solid #808080;
      padding-left: 12pt;
      margin: 12pt 0;
      color: #404040;
      font-style: italic;
    }

    a { color: #0563c1; text-decoration: underline; }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }

    td, th {
      border: 1px solid #e5e7eb;
      padding: 0 5pt;
      vertical-align: top;
      box-sizing: border-box;
      color: #1f2937;
      background: #fff;

      /* cực quan trọng cho table: cho phép bẻ chữ trong cell khi in */
      overflow-wrap: anywhere;
      word-break: break-word;
      white-space: normal;
    }

    table.no-border td,
    table.no-border th {
      border: none !important;
      border-bottom: 1px solid transparent !important;
    }

    img { max-width: 100%; height: auto; margin: 6pt 0; }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Tránh “cố giữ” khối khiến layout không bẻ dòng tốt */
      table, img, pre, blockquote {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /* Widows/orphans giúp đoạn văn chia trang ổn hơn */
      p { orphans: 3; widows: 3; }
    }
  </style>
  `

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      ${styleSheet}
    </head>
    <body>${html}</body>
  </html>`
}
