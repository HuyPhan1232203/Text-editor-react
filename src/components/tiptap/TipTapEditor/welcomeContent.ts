import { REPO_URL } from '@/config/constants'

/**
 * Shown once to first-time visitors (empty document, not in a ?room), always in English.
 * It doubles as a tour of the features, so everything below is editable.
 */
export const WELCOME_CONTENT = `
<h1>Welcome to Text Editor React 👋</h1>
<p>A Word / Google Docs–like editor that runs entirely in your browser: real A4 pages, margins, tables, math, images, autosave and PDF export. This document is just for you to try things out — edit or delete anything.</p>

<h2>Try it in one minute</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><p>Open this page for the first time</p></li>
  <li data-type="taskItem" data-checked="false"><p>Type <code>/</code> on an empty line to insert a heading, table, code block or YouTube video</p></li>
  <li data-type="taskItem" data-checked="false"><p>Hover a paragraph and drag the <strong>⋮⋮</strong> handle on its left to move it</p></li>
  <li data-type="taskItem" data-checked="false"><p><strong>Select</strong> some text to bring up the quick formatting bar</p></li>
  <li data-type="taskItem" data-checked="false"><p>Type <code>:rocket:</code> to insert an emoji, or use the 😊 button in the toolbar</p></li>
  <li data-type="taskItem" data-checked="false"><p><strong>Right-click</strong> a cell in the table below to add rows, merge cells or color them</p></li>
  <li data-type="taskItem" data-checked="false"><p>Paste a screenshot (Ctrl/Cmd + V), then click it to wrap text around it</p></li>
  <li data-type="taskItem" data-checked="false"><p>Click <strong>Export PDF</strong> and choose “Save as PDF”</p></li>
</ul>

<h2>What's inside?</h2>
<table>
  <tbody>
    <tr><th><p>Feature</p></th><th><p>Description</p></th></tr>
    <tr><td><p>📄 A4 pages</p></td><td><p>Content flows across real sheets; long tables split between rows and repeat their header</p></td></tr>
    <tr><td><p>🖼️ Images</p></td><td><p>Paste, drop, resize, wrap text left / right</p></td></tr>
    <tr><td><p>📊 Tables</p></td><td><p>Merge / split cells, background color, vertical alignment, hide borders</p></td></tr>
    <tr><td><p>💾 Autosave</p></td><td><p>Reload the page and your document is still here (saved in your browser)</p></td></tr>
    <tr><td><p>👥 Collaboration</p></td><td><p>Add <code>?room=my-team</code> to the URL to edit together in real time</p></td></tr>
    <tr><td><p>🖨️ PDF export</p></td><td><p>Keeps paper size, margins and page breaks, with page numbers in the footer</p></td></tr>
  </tbody>
</table>

<h2>Math and formatting</h2>
<p>Einstein's most famous formula: <span data-type="inline-math" data-latex="E = mc^2"></span>, or the quadratic formula: <span data-type="inline-math" data-latex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"></span>.</p>
<p>Text can be <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, <s>struck through</s>, <mark data-color="#fef08a" style="background-color: #fef08a">highlighted</mark>, or <span style="color: #1a73e8">colored</span>.</p>
<blockquote><p>Tip: paste content from Google Docs — headings, lists, checklists and tables are kept.</p></blockquote>

<h2>Handy shortcuts</h2>
<ul>
  <li><p><code>Ctrl/Cmd + B / I / U</code> — bold, italic, underline</p></li>
  <li><p><code>/</code> — insert any block, <code>Ctrl/Cmd + F</code> — find, <code>Ctrl/Cmd + H</code> — find and replace</p></li>
  <li><p><code>Ctrl/Cmd + Z</code> — undo, <code>Ctrl/Cmd + Shift + Z</code> — redo</p></li>
  <li><p>Type <code>#</code> + space at the start of a line for a heading, <code>-</code> + space for a list</p></li>
</ul>

<h2>About the author</h2>
<img src="/welcome/author.jpg" alt="Phan Nhật Huy" width="129" height="167" data-wrap="left">
<p><strong>Phan Nhật Huy</strong></p>
<p>Author and developer of Text Editor React.</p>
<p>🐙 GitHub: <a href="https://github.com/HuyPhan1232203">github.com/HuyPhan1232203</a></p>
<p>✉️ Email: <a href="mailto:huyphan1232203@gmail.com">huyphan1232203@gmail.com</a></p>
<p>Feedback, bug reports or collaboration ideas — get in touch!</p>

<p>Open source (MIT) on GitHub: <a href="${REPO_URL}">${REPO_URL.replace('https://', '')}</a> — if you find it useful, give the project a ⭐!</p>
`
