// Optional PDF export backend (https://github.com/HuyPhan1232203/PDF-export-Puppeteer).
// When unset, PDF export uses the browser's print dialog instead.
export const PDF_API_URL: string | undefined = import.meta.env.VITE_PDF_API_URL || undefined

export const API_ENDPOINTS = {
  GENERATE_PDF: `${PDF_API_URL}/pdf/generate`
}

export const COPYRIGHT = '© 2026 Phan Nhật Huy'

export const REPO_URL = 'https://github.com/HuyPhan1232203/Text-editor-react'
