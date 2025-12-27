# TEXT EDITOR REACT

<div align="center">

[![React](https://img.shields.io/badge/React-18.0%2B-61dafb?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0%2B-646cff?style=flat&logo=vite)](https://vitejs.dev)
[![TipTap](https://img.shields.io/badge/TipTap-2.0%2B-4ade80?style=flat)](https://tiptap.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

A professional-grade rich text editor built with React and TipTap for creating formatted documents with real-time preview and seamless DOCX export.

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Architecture](#architecture) • [API Documentation](#api-documentation)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

E-Office is a modern, feature-rich text editor for the web that provides WYSIWYG (What You See Is What You Get) editing with professional document formatting capabilities. Built with React and TipTap, it enables users to create, edit, and export formatted documents to DOCX format with pixel-perfect accuracy.

The editor is specifically designed to work with a backend JSON-to-DOCX conversion engine, allowing seamless document generation with precise control over page layout, margins, typography, and table structures.

---

## Features

### 📝 Core Editing Capabilities
- **Rich Text Formatting**: Bold, italic, underline, strikethrough, text color, and highlight
- **Text Alignment**: Left, center, right, and justify alignment options
- **Paragraph Styling**: Customizable spacing (before/after), line height control
- **Font Management**: Font family and size selection with professional typography support
- **List Support**: Ordered lists, unordered lists, and todo lists with checkbox functionality

### 📋 Table Support
- **Dynamic Table Creation**: Create and customize tables with configurable rows and columns
- **Cell Management**: Merge/split cells, set cell width and padding
- **Table Formatting**: Cell background colors, border customization, alignment options
- **Table Toolbar**: Dedicated toolbar for quick table operations

### 🖼️ Advanced Features
- **Page Management**: A4 page format with realistic page preview (WYSIWYG)
- **Margin Configuration**: Full control over page margins (top, bottom, left, right)
- **Pagination Support**: Automatic page break management
- **Image Upload**: Insert and manage images within the document
- **Heading Support**: Multiple heading levels (H1-H6) with predefined styles
- **Link Support**: Insert, edit, and manage hyperlinks with URL validation

### 🎨 UI/UX Features
- **Real-time Preview**: WYSIWYG editing with accurate page representation
- **Responsive Design**: Adaptive toolbar and interface for different screen sizes
- **Keyboard Shortcuts**: Standard shortcuts for common formatting operations

### 📊 Export & Integration
- **Page Settings Dialog**: Quick access to page size, orientation, and margins
- **Format Preservation**: Maintains all formatting in exported documents

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.0+ | UI framework |
| **TypeScript** | 5.0+ | Type-safe development |
| **Vite** | 5.0+ | Build tool and dev server |
| **TipTap** | 2.0+ | Rich text editor core |
| **Radix UI** | Latest | Accessible UI components |
| **SCSS** | Latest | Styling |
| **pnpm** | 8.0+ | Package manager |

---

## Installation

### Prerequisites
- **Node.js** 18+ 
- **pnpm** 8.0+ (or npm/yarn)

### Step 1: Clone the Repository

\`\`\`bash
git clone <repository-url>
cd text-editor-react
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### Step 3: Environment Setup (Optional)

Create a `.env` file if backend API configuration is needed:

\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`

### Step 4: Start Development Server

\`\`\`bash
pnpm run dev
\`\`\`

The editor will be available at `http://localhost:5173` (default Vite port).

### Step 5: Build for Production

\`\`\`bash
pnpm run build
\`\`\`

Output will be in the `dist/` directory.

---

### Configuring Page Settings

Access the **Page Settings Dialog** from the toolbar to configure:

1. **Page Size**: Select between standard formats (A4, Letter, etc.)
2. **Orientation**: Choose portrait or landscape mode
3. **Margins**: Set top, bottom, left, right margins in mm/cm/inch
4. **Units**: Toggle between metric and imperial measurements

### Creating Content

#### Adding Text

Simply click in the editor and start typing. Use the toolbar to format:

- **Font Selection**: Choose from system fonts
- **Font Size**: Set size in points (pt)
- **Text Formatting**: Apply bold, italic, underline
- **Colors**: Set text color and highlight color
- **Alignment**: Choose alignment option

#### Creating Tables

1. Click **Table** button in toolbar
2. Specify rows and columns in the dialog
3. Click cells to edit content
4. Use **Table Cell Toolbar** for cell operations:
   - Insert/delete rows/columns
   - Set cell width and padding
   - Customize cell background

#### Inserting Lists

- **Bullet List**: Click list icon, then bullet option
- **Numbered List**: Click list icon, then number option
- **Todo List**: Click list icon, then checkbox option

#### Adding Images

1. Click **Image** button in toolbar
2. Upload image from your device
3. Adjust image size and position within the page

### Exporting Documents

1. Click **Export** or **Download** button
2. Choose format (DOCX recommended for Microsoft Word)
3. Document downloads with all formatting preserved

---

## Architecture

### Component Structure

\`\`\`
src/components/
├── TipTapEditor/
│   ├── index.tsx                 # Main editor component
│   ├── constants.ts              # Editor configuration
│   ├── types.ts                  # TypeScript interfaces
│   └── components/               # Sub-components
├── TextToolbar/
│   ├── index.tsx                 # Formatting toolbar
│   ├── components/               # Toolbar button groups
│   └── hooks/                    # Custom toolbar hooks
├── tableTiptap/
│   ├── CreateTablePopover.tsx    # Table creation dialog
│   ├── TableCellToolbar.tsx      # Cell editing toolbar
│   └── helper/                   # Table utilities
├── tiptap/
│   ├── header/                   # Heading management
│   ├── paging/                   # Pagination extension
│   ├── tiptap-extension/         # Custom TipTap extensions
│   ├── tiptap-node/              # Custom node definitions
│   └── tiptap-ui/                # Editor UI primitives
└── ui/                           # Reusable UI components
\`\`\`

### Data Flow

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                   React Component Tree                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                TipTapEditor Component                        │
│  • Manages editor state                                      │
│  • Handles user interactions                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               TipTap Editor Core Engine                      │
│  • Renders editable content                                  │
│  • Manages document structure (ProseMirror)                 │
│  • Applies formatting extensions                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Toolbar & Page Settings                         │
│  • TextToolbar: Formatting options                          │
│  • PageSettingDialog: Layout configuration                  │
│  • TableCellToolbar: Table operations                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Export & Backend Integration                         │
│  • Generate Document JSON                                    │
│  • Send to backend for DOCX conversion                      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### Key Modules

#### Page Sizing & Rendering
- **A4 Standard**: 210mm × 297mm (8.27" × 11.69")
- **On Screen** (96 DPI): ~794px × 1123px
- **Zoom Support**: 50%, 75%, 100%, 150%, 200%

#### Margin Management
- Margins stored in inches (converted from mm/cm)
- Conversion: `inch = mm / 25.4` or `inch = cm / 2.54`
- Content area calculated after margin subtraction

---

## Development Commands

\`\`\`bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linter
pnpm run lint
\`\`\`

---

## Project Structure Reference

| Directory | Purpose |
|-----------|---------|
| `src/components/` | React components |
| `src/hooks/` | Custom React hooks |
| `src/lib/` | Utility functions and helpers |
| `src/styles/` | Global and component styles |
| `src/types/` | TypeScript type definitions |
| `src/config/` | Application configuration |
| `public/` | Static assets |

---

## Performance Optimization

### Best Practices

1. **Lazy Loading**: TipTap extensions load on demand
2. **Memoization**: Components use React.memo where appropriate
3. **Event Delegation**: Toolbar uses event bubbling efficiently
4. **CSS Modules**: Scoped styling prevents conflicts

### Monitoring

- Use React DevTools Profiler for component performance
- Check Network tab for asset loading times
- Monitor memory usage with browser DevTools

---

## Support

For issues, questions, or suggestions:

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check inline code comments and README
- **Examples**: Refer to example usage in component files

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Acknowledgments

- Built with [TipTap](https://tiptap.dev) - The headless editor framework
- UI Components from [Radix UI](https://www.radix-ui.com)
- Styling with [SCSS](https://sass-lang.com)
- Build tooling by [Vite](https://vitejs.dev)

---

**Last Updated**: December 2025 | **Version**: 1.0.0
EOF