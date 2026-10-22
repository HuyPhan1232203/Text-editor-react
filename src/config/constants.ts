// Base URL of the PDF export backend (https://github.com/HuyPhan1232203/PDF-export-Puppeteer)
const PDF_API_URL = import.meta.env.VITE_PDF_API_URL ?? 'http://localhost:3000'

export const API_ENDPOINTS = {
  GENERATE_PDF: `${PDF_API_URL}/pdf/generate`
}
