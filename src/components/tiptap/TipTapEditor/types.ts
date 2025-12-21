export interface PageSettings {
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  orientation: 'landscape' | 'portrait'
}

export interface TableBorderStates {
  [key: number]: boolean
}
