// lib/tiptap-to-docx-converter.ts

interface DocModelJSON {
  topMargin: number      // inch
  bottomMargin: number   // inch
  leftMargin: number     // inch
  rightMargin: number    // inch
  blocks: Block[]
}

interface Block {
  type: string  // "paragraph" hoặc "table"
  paragraph?: ParagraphModel
  table?: TableModel
}

interface ParagraphModel {
  alignment: string  // "left", "center", "right", "justify"
  spacing: {
    before: number  // point (pt)
    after: number   // point (pt)
  }
  runs: RunModel[]
}

interface RunModel {
  bold: boolean
  italic: boolean
  underline: boolean
  font: string
  fontSize: number      // point (pt) - backend sẽ nhân 2 thành half-point
  fontColor: string     // "#RRGGBB"
  text: string          // có thể chứa \n để xuống dòng
}

interface TableModel {
  preferredWidth: number  // inch
  alignment: string       // "left", "center", "right", "none"
  cellMargin: {
    top: number     // inch
    bottom: number  // inch
    left: number    // inch
    right: number   // inch
  }
  rows: RowModel[]
}

interface RowModel {
  cells: CellModel[]
}

interface CellModel {
  width: number              // inch
  paragraphs: ParagraphModel[]
}

// ===== HELPER FUNCTIONS =====

// Chuyển mm sang inch
export function mmToInch (mm: number): number {
  return mm / 25.4
}

// Chuyển px sang pt (assuming 96 DPI)
export function pxToPt (px: number): number {
  return px * 0.75
}

// Parse font size từ string (16pt, 16px, 1rem) về pt
function parseFontSize (fontSize: string | undefined): number {
  if (!fontSize) return 12

  const match = fontSize.match(/(\d+\.?\d*)(pt|px|rem)?/)

  if (!match) return 12

  const value = parseFloat(match[1])
  const unit = match[2]

  switch (unit) {
    case 'px':
      return pxToPt(value)
    case 'rem':
      return value * 12  // assuming 16px = 12pt base
    case 'pt':
    default:
      return value
  }
}

// Convert alignment
function convertAlignment (align: string | undefined): string {
  switch (align?.toLowerCase()) {
    case 'center': return 'center'
    case 'right': return 'right'
    case 'justify': return 'justify'
    default: return 'left'
  }
}

// Lấy attributes từ textStyle mark
function getTextStyleAttrs (marks: any[] | undefined) {
  const textStyleMark = marks?.find(m => m.type === 'textStyle')

  return textStyleMark?.attrs || {}
}

// ===== CONVERT FUNCTIONS =====

// Convert text node thành RunModel
function convertTextToRun (textNode: any): RunModel {
  const marks = textNode.marks || []
  const textStyleAttrs = getTextStyleAttrs(marks)

  return {
    bold: marks.some((m: any) => m.type === 'bold'),
    italic: marks.some((m: any) => m.type === 'italic'),
    underline: marks.some((m: any) => m.type === 'underline' || m.type === 'strike'),
    font: textStyleAttrs.fontFamily || 'Times New Roman',
    fontSize: parseFontSize(textStyleAttrs.fontSize),
    fontColor: textStyleAttrs.color || '#000000',
    text: textNode.text || ''
  }
}

// Convert hard break (shift+enter) thành Run với \n
function convertHardBreak (): RunModel {
  return {
    bold: false,
    italic: false,
    underline: false,
    font: 'Times New Roman',
    fontSize: 12,
    fontColor: '#000000',
    text: '\n'
  }
}

// Convert paragraph node thành ParagraphModel
function convertParagraph (node: any): ParagraphModel {
  const runs: RunModel[] = []

  if (node.content) {
    for (const child of node.content) {
      if (child.type === 'text') {
        runs.push(convertTextToRun(child))
      } else if (child.type === 'hardBreak') {
        runs.push(convertHardBreak())
      }
    }
  }

  // Paragraph rỗng - thêm run rỗng
  if (runs.length === 0) {
    runs.push({
      bold: false,
      italic: false,
      underline: false,
      font: 'Times New Roman',
      fontSize: 12,
      fontColor: '#000000',
      text: ''
    })
  }

  return {
    alignment: convertAlignment(node.attrs?.textAlign),
    spacing: {
      before: 6,  // default spacing in pt
      after: 6
    },
    runs
  }
}

// Convert heading thành ParagraphModel với font size lớn hơn
function convertHeading (node: any): ParagraphModel {
  const paragraph = convertParagraph(node)
  const level = node.attrs?.level || 1

  // Font size cho mỗi heading level
  const headingSizes: Record<number, number> = {
    1: 24,
    2: 18,
    3: 14,
    4: 12,
    5: 11,
    6: 10
  }

  // Áp dụng size và bold cho tất cả runs
  paragraph.runs.forEach(run => {
    run.fontSize = headingSizes[level] || 12
    run.bold = true
  })

  // Spacing lớn hơn cho heading
  paragraph.spacing.before = 12
  paragraph.spacing.after = 6

  return paragraph
}

// Convert blockquote thành ParagraphModel
function convertBlockquote (node: any): ParagraphModel[] {
  const paragraphs: ParagraphModel[] = []

  if (node.content) {
    for (const child of node.content) {
      if (child.type === 'paragraph') {
        const para = convertParagraph(child)

        // Style cho blockquote
        para.runs.forEach(run => {
          run.italic = true
          run.fontColor = '#666666'
        })
        paragraphs.push(para)
      }
    }
  }

  return paragraphs
}

// Convert list item thành ParagraphModel với bullet/number
function convertListItem (listItemNode: any, isBullet: boolean, index: number): ParagraphModel[] {
  const paragraphs: ParagraphModel[] = []

  if (listItemNode.content) {
    for (let i = 0; i < listItemNode.content.length; i++) {
      const child = listItemNode.content[i]

      if (child.type === 'paragraph') {
        const para = convertParagraph(child)

        // Thêm bullet hoặc number vào run đầu tiên
        if (i === 0 && para.runs.length > 0) {
          const prefix = isBullet ? '• ' : `${index + 1}. `

          para.runs[0].text = prefix + para.runs[0].text
        }

        paragraphs.push(para)
      }
    }
  }

  return paragraphs
}

// Convert table thành TableModel
function convertTable (node: any): TableModel {
  const rows: RowModel[] = []

  if (node.content) {
    for (const rowNode of node.content) {
      if (rowNode.type === 'tableRow') {
        const cells: CellModel[] = []

        if (rowNode.content) {
          for (const cellNode of rowNode.content) {
            if (cellNode.type === 'tableCell' || cellNode.type === 'tableHeader') {
              const paragraphs: ParagraphModel[] = []

              if (cellNode.content) {
                for (const contentNode of cellNode.content) {
                  if (contentNode.type === 'paragraph') {
                    const para = convertParagraph(contentNode)

                    // Cell header (tableHeader) - make bold
                    if (cellNode.type === 'tableHeader') {
                      // eslint-disable-next-line no-return-assign
                      para.runs.forEach(run => run.bold = true)
                    }

                    paragraphs.push(para)
                  } else if (contentNode.type === 'heading') {
                    paragraphs.push(convertHeading(contentNode))
                  }
                }
              }

              // Cell rỗng
              if (paragraphs.length === 0) {
                paragraphs.push({
                  alignment: 'left',
                  spacing: { before: 3, after: 3 },
                  runs: [{
                    bold: false,
                    italic: false,
                    underline: false,
                    font: 'Times New Roman',
                    fontSize: 11,
                    fontColor: '#000000',
                    text: ''
                  }]
                })
              }

              // Cell width - mặc định hoặc từ attrs
              const cellWidth = cellNode.attrs?.colwidth?.[0]
                ? pxToPt(cellNode.attrs.colwidth[0]) / 72  // px to inch
                : 2.0  // default 2 inches

              cells.push({
                width: cellWidth,
                paragraphs
              })
            }
          }
        }

        if (cells.length > 0) {
          rows.push({ cells })
        }
      }
    }
  }

  return {
    preferredWidth: 6.0,  // A4 content width with 1" margins
    alignment: 'center',
    cellMargin: {
      top: 0.05,     // ~1.27mm
      bottom: 0.05,
      left: 0.05,
      right: 0.05
    },
    rows
  }
}

// ===== MAIN CONVERTER =====

export function convertTiptapToDocModel (
  tiptapJSON: any,
  pageMargins: {
    topMargin?: number     // mm
    bottomMargin?: number  // mm
    leftMargin?: number    // mm
    rightMargin?: number   // mm
  } = {}
): DocModelJSON {
  const docModel: DocModelJSON = {
    topMargin: mmToInch(pageMargins.topMargin ?? 25.4),     // 1 inch default
    bottomMargin: mmToInch(pageMargins.bottomMargin ?? 25.4),
    leftMargin: mmToInch(pageMargins.leftMargin ?? 25.4),
    rightMargin: mmToInch(pageMargins.rightMargin ?? 25.4),
    blocks: []
  }

  if (!tiptapJSON.content) {
    return docModel
  }

  for (const node of tiptapJSON.content) {
    switch (node.type) {
      case 'paragraph':
        docModel.blocks.push({
          type: 'paragraph',
          paragraph: convertParagraph(node)
        })
        break

      case 'heading':
        docModel.blocks.push({
          type: 'paragraph',
          paragraph: convertHeading(node)
        })
        break

      case 'table':
        docModel.blocks.push({
          type: 'table',
          table: convertTable(node)
        })
        break

      case 'bulletList':
        if (node.content) {
          node.content.forEach((listItem: any, index: number) => {
            const paras = convertListItem(listItem, true, index)

            paras.forEach(para => {
              docModel.blocks.push({
                type: 'paragraph',
                paragraph: para
              })
            })
          })
        }
        break

      case 'orderedList':
        if (node.content) {
          node.content.forEach((listItem: any, index: number) => {
            const paras = convertListItem(listItem, false, index)

            paras.forEach(para => {
              docModel.blocks.push({
                type: 'paragraph',
                paragraph: para
              })
            })
          })
        }
        break

      case 'blockquote':
      { const quoteParagraphs = convertBlockquote(node)

        quoteParagraphs.forEach(para => {
          docModel.blocks.push({
            type: 'paragraph',
            paragraph: para
          })
        })
        break }

      case 'codeBlock':
        // Convert code block thành paragraph với monospace font
        if (node.content) {
          for (const textNode of node.content) {
            if (textNode.type === 'text') {
              docModel.blocks.push({
                type: 'paragraph',
                paragraph: {
                  alignment: 'left',
                  spacing: { before: 3, after: 3 },
                  runs: [{
                    bold: false,
                    italic: false,
                    underline: false,
                    font: 'Courier New',
                    fontSize: 10,
                    fontColor: '#000000',
                    text: textNode.text || ''
                  }]
                }
              })
            }
          }
        }
        break

      case 'horizontalRule':
        // Convert horizontal rule thành paragraph với underline
        docModel.blocks.push({
          type: 'paragraph',
          paragraph: {
            alignment: 'center',
            spacing: { before: 6, after: 6 },
            runs: [{
              bold: false,
              italic: false,
              underline: true,
              font: 'Times New Roman',
              fontSize: 12,
              fontColor: '#000000',
              text: '                                                  '
            }]
          }
        })
        break
    }
  }

  return docModel
}

// Export example JSON for testing
export function getExampleDocModelJSON (): string {
  const example: DocModelJSON = {
    topMargin: 1.0,
    bottomMargin: 1.0,
    leftMargin: 1.0,
    rightMargin: 1.0,
    blocks: [
      {
        type: 'paragraph',
        paragraph: {
          alignment: 'center',
          spacing: {
            before: 12,
            after: 6
          },
          runs: [
            {
              bold: true,
              italic: false,
              underline: false,
              font: 'Times New Roman',
              fontSize: 18,
              fontColor: '#000000',
              text: 'Tiêu đề tài liệu'
            }
          ]
        }
      },
      {
        type: 'paragraph',
        paragraph: {
          alignment: 'justify',
          spacing: {
            before: 6,
            after: 6
          },
          runs: [
            {
              bold: false,
              italic: false,
              underline: false,
              font: 'Times New Roman',
              fontSize: 12,
              fontColor: '#000000',
              text: 'Đây là đoạn văn mẫu với chữ '
            },
            {
              bold: true,
              italic: false,
              underline: false,
              font: 'Times New Roman',
              fontSize: 12,
              fontColor: '#FF0000',
              text: 'đậm màu đỏ'
            },
            {
              bold: false,
              italic: false,
              underline: false,
              font: 'Times New Roman',
              fontSize: 12,
              fontColor: '#000000',
              text: ' và chữ '
            },
            {
              bold: false,
              italic: true,
              underline: false,
              font: 'Times New Roman',
              fontSize: 12,
              fontColor: '#0000FF',
              text: 'nghiêng màu xanh'
            }
          ]
        }
      },
      {
        type: 'table',
        table: {
          preferredWidth: 6.0,
          alignment: 'center',
          cellMargin: {
            top: 0.05,
            bottom: 0.05,
            left: 0.05,
            right: 0.05
          },
          rows: [
            {
              cells: [
                {
                  width: 3.0,
                  paragraphs: [
                    {
                      alignment: 'center',
                      spacing: { before: 3, after: 3 },
                      runs: [
                        {
                          bold: true,
                          italic: false,
                          underline: false,
                          font: 'Times New Roman',
                          fontSize: 12,
                          fontColor: '#000000',
                          text: 'Cột 1'
                        }
                      ]
                    }
                  ]
                },
                {
                  width: 3.0,
                  paragraphs: [
                    {
                      alignment: 'center',
                      spacing: { before: 3, after: 3 },
                      runs: [
                        {
                          bold: true,
                          italic: false,
                          underline: false,
                          font: 'Times New Roman',
                          fontSize: 12,
                          fontColor: '#000000',
                          text: 'Cột 2'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    ]
  }

  return JSON.stringify(example, null, 2)
}
