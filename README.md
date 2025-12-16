# Hướng dẫn FE dựng trang & JSON cho engine Json → DOCX

## 1. Tổng quan

Backend có hàm:

```csharp
JsonToDocx.ConvertJsonToDocx(string jsonPath, string outputPath);
```

- FE chỉ cần tạo JSON mô tả tài liệu (page size, margin, paragraph, table…).
- Backend đọc JSON và xuất file `.docx` đúng kích thước trang & lề.

README này trả lời cho FE:
1. Dựng page kích thước bao nhiêu trên màn hình.
2. Tính vùng “từ lề vào” như thế nào.
3. JSON schema cơ bản cần sinh.

---

## 2. Kích thước trang (PageSize)

Trong backend, đang dùng A4 dọc:

```csharp
new PageSize
{
    Width = 11906,
    Height = 16838,
    Orient = PageOrientationValues.Portrait
}
```

- Đơn vị: twip  
  - 1 inch = 1440 twip  
  - 1 inch = 25.4 mm
- Tương đương A4:
  - Rộng ≈ 8.27 inch ≈ 210 mm  
  - Cao  ≈ 11.69 inch ≈ 297 mm

### 2.1. FE dựng page trên UI

Giả sử browser dùng 96 DPI:

- Page width ≈ 8.27 × 96 ≈ 794 px
- Page height ≈ 11.69 × 96 ≈ 1123 px

**Gợi ý:**

- FE dựng frame trang khoảng 794 × 1123 px (A4 tỉ lệ chuẩn).
- Cho phép zoom (50%, 75%, 100%, 150%…) nhưng luôn giữ tỉ lệ width:height (210:297).

---

## 3. Lề trang (margin) – “từ lề vào”

Backend đọc margin từ `DocModel` (đơn vị inch):

```csharp
PageMargin
{
    Top    = Convert.ToInt32(1440 * model.TopMargin),
    Bottom = Convert.ToInt32(1440 * model.BottomMargin),
    Left   = (uint)(1440 * model.LeftMargin),
    Right  = (uint)(1440 * model.RightMargin),
    Header = (uint)(1440 * 1),
    Footer = (uint)(1440 * 1)
}
```

- `TopMargin`, `BottomMargin`, `LeftMargin`, `RightMargin` trong JSON là inch.
- Backend nhân 1440 để ra twip.

### 3.1. FE nhập margin mm/cm → inch

Công thức chuyển đổi:

```text
inch = mm / 25.4
inch = cm / 2.54
```

Ví dụ margin chuẩn Word (1 inch = 2.54 cm):

```json
{
  "topMargin": 1.0,
  "bottomMargin": 1.0,
  "leftMargin": 1.0,
  "rightMargin": 1.0
}
```

### 3.2. FE tính vùng nội dung “từ lề vào”

Với page A4 794 × 1123 px và margin 1 inch:

- DPI = 96
- Margin px = 1 × 96 = 96 px

Vùng content:

- X = LeftMarginInch × DPI  → 96 px  
- Y = TopMarginInch × DPI   → 96 px  
- ContentWidth  ≈ (8.27 − 1 − 1) × 96 ≈ 602 px  
- ContentHeight ≈ (11.69 − 1 − 1) × 96 ≈ 924 px  

Trên UI, FE chỉ cho phép đặt text/bảng trong content box (96, 96, 602, 924). Phần ngoài là lề trắng.

---

## 4. JSON DocModel tổng quát

Backend deserialize:

```csharp
var docModel = JsonConvert.DeserializeObject<DocModel>(json) ?? new DocModel();
```

Và render từng block:

```csharp
foreach (var block in docModel.Blocks)
{
    switch (block.Type.ToLower())
    {
        case "paragraph":
            body.Append(BuildParagraph(block.Paragraph));
            break;
        case "table":
            body.Append(BuildTable(block.Table));
            break;
    }
}
```

Gợi ý schema DocModel:

```json
{
  "topMargin": 1.0,
  "bottomMargin": 1.0,
  "leftMargin": 1.0,
  "rightMargin": 1.0,
  "blocks": [
    {
      "type": "paragraph",
      "paragraph": { }
    },
    {
      "type": "table",
      "table": { }
    }
  ]
}
```

---

## 5. Paragraph (đoạn văn)

`ParagraphModel` gồm:

- `alignment`: "left" | "center" | "right" | "justify"
- `spacing.before`, `spacing.after`: point (pt)
- `runs`: danh sách Run

Ví dụ backend:

```csharp
pPr.Justification = new Justification
{
    Val = para.Alignment.ToLower() switch
    {
        "center"  => JustificationValues.Center,
        "right"   => JustificationValues.Right,
        "justify" => JustificationValues.Both,
        _         => JustificationValues.Left
    }
};

pPr.SpacingBetweenLines = new SpacingBetweenLines
{
    Line     = "240",
    LineRule = LineSpacingRuleValues.Auto,
    Before   = ((int)(para.Spacing.Before * 20)).ToString(),
    After    = ((int)(para.Spacing.After * 20)).ToString()
};
```

JSON Paragraph mẫu:

```json
{
  "type": "paragraph",
  "paragraph": {
    "alignment": "justify",
    "spacing": {
      "before": 6,
      "after": 6
    },
    "runs": [
      {
        "bold": true,
        "italic": false,
        "underline": false,
        "font": "Times New Roman",
        "fontSize": 12,
        "fontColor": "#000000",
        "text": "Đây là đoạn văn mẫu do FE sinh ra."
      }
    ]
  }
}
```

---

## 6. Run (chuỗi text + format)

Run gồm:

- `bold`, `italic`, `underline`: boolean
- `font`: string (tên font)
- `fontSize`: point (pt) – backend nhân 2 thành half-point
- `fontColor`: "#RRGGBB"
- `text`: string  
  - Nếu chứa `\n`, backend tách và chèn Break để xuống dòng.

JSON Run mẫu:

```json
{
  "bold": true,
  "italic": false,
  "underline": false,
  "font": "Times New Roman",
  "fontSize": 11,
  "fontColor": "#333333",
  "text": "Xin chào,\nĐây là dòng thứ hai."
}
```

---

## 7. Table

`TableModel`:

- `preferredWidth`: inch (bề rộng bảng)
- `alignment`: "left" | "center" | "right" | "none"
- `cellMargin.top/bottom/left/right`: inch
- `rows[].cells[].width`: inch
- `rows[].cells[].paragraphs`: danh sách Paragraph

Ví dụ backend:

```csharp
if (tbl.PreferredWidth != null)
{
    tblPr.Append(new TableWidth
    {
        Width = (tbl.PreferredWidth * 1440).ToString()
    });
}
```

JSON Table mẫu:

```json
{
  "type": "table",
  "table": {
    "preferredWidth": 6.0,
    "alignment": "center",
    "cellMargin": {
      "top": 0.05,
      "bottom": 0.05,
      "left": 0.05,
      "right": 0.05
    },
    "rows": [
      {
        "cells": [
          {
            "width": 3.0,
            "paragraphs": [
              {
                "alignment": "center",
                "spacing": { "before": 3, "after": 3 },
                "runs": [
                  { "text": "Cột 1", "bold": true, "fontSize": 12 }
                ]
              }
            ]
          },
          {
            "width": 3.0,
            "paragraphs": [
              {
                "alignment": "center",
                "spacing": { "before": 3, "after": 3 },
                "runs": [
                  { "text": "Cột 2", "bold": true, "fontSize": 12 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 8. Checklist cho FE

1. Page
   - Canvas ~794 × 1123 px (A4 @96dpi), portrait.

2. Margin
   - Cho nhập mm/cm, convert sang inch, lưu vào `topMargin`, `bottomMargin`, `leftMargin`, `rightMargin`.
   - Vẽ content box tương ứng.

3. Paragraph & Run
   - UI cho alignment, font, size, bold/italic/underline, color, spacing.
   - Sinh JSON theo model Paragraph/Run.

4. Table
   - UI cho width bảng, width cell, cell margin, alignment.
   - Cell chứa danh sách Paragraph.

5. Export
   - FE gom toàn bộ thành DocModel JSON.
   - Gửi backend để convert ra `.docx` qua `JsonToDocx.ConvertJsonToDocx`.
