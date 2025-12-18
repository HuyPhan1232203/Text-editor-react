export function inlineStyles (html: string): string {
  const styleSheet = `
    <style>
      body {
        font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
        margin: 0;
        padding: 0;
        background-color: transparent;
      }
      
      p {
        color: #000;
        margin: 0;
        line-height: 1.5;
        font-size: 11pt;
      }
      
      h1, h2, h3, h4, h5, h6 {
        line-height: 1.3;
        font-weight: 700;
        margin: 12pt 0 6pt 0;
        color: #000;
        font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
      }
      
      h1 { font-size: 26pt; }
      h2 { font-size: 19pt; }
      h3 { font-size: 14pt; }
      h4 { font-size: 13pt; }
      h5 { font-size: 12pt; }
      h6 { font-size: 11pt; }
      
      ul, ol {
        padding-left: 36pt;
        margin: 6pt 0;
        color: #000;
      }
      
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      
      ul ul { 
        list-style-type: circle;
        margin-top: 3pt;
        margin-bottom: 3pt;
      }
      ul ul ul { list-style-type: square; }
      
      ol ol { 
        list-style-type: lower-alpha;
        margin-top: 3pt;
        margin-bottom: 3pt;
      }
      ol ol ol { list-style-type: lower-roman; }
      
      ul > li > ol,
      ol > li > ul {
        margin-top: 0.5rem;
      }
      
      li {
        margin: 3pt 0;
        padding-left: 6pt;
      }
      
      li > p {
        margin: 0;
        line-height: 1.5;
      }
      
      code {
        background-color: #f2f2f2;
        color: #000;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 10pt;
        font-family: 'Courier New', monospace;
      }
      
      pre {
        background-color: #f2f2f2;
        border: 1px solid #d0d0d0;
        padding: 8px;
        border-radius: 2px;
        overflow-x: auto;
        margin: 12pt 0;
      }
      
      pre code {
        background-color: transparent;
        padding: 0;
      }
      
      blockquote {
        border-left: 4pt solid #808080;
        padding-left: 12pt;
        margin: 12pt 0;
        color: #404040;
        font-style: italic;
      }
      
      a {
        color: #0563c1;
        text-decoration: underline;
        cursor: pointer;
      }
      
      a:hover {
        color: #054399;
      }
      
      table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        overflow: hidden;
      }
      
      table td,
      table th {
        min-width: 1em;
        border: 1px solid #e5e7eb;
        padding-right: 5pt;
        padding-left: 5pt;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        color: #1f2937;
        background-color: #fff;
        word-wrap: break-word;
        word-break: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
      }
      
      table.no-border td,
      table.no-border th {
        border: none !important;
        border-bottom: 1px solid transparent !important;
      }
      
      strong, b { font-weight: 700; }
      em, i { font-style: italic; }
      u { text-decoration: underline; }
      s, del { text-decoration: line-through; }
      
      hr {
        border: none;
        border-top: 0.5pt solid #000;
        margin: 12pt 0;
        height: 0;
      }
      
      img {
        max-width: 100%;
        height: auto;
        margin: 6pt 0;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        p {
          orphans: 3;
          widows: 3;
        }
        
        img, table {
          page-break-inside: avoid;
        }
      }
    </style>
  `

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${styleSheet}
</head>
<body>
  ${html}
</body>
</html>`
}
