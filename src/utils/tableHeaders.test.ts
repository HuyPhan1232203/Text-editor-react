import { describe, expect, it } from 'vitest'
import { repeatTableHeaders } from './tableHeaders'

function render (html: string): HTMLElement {
  const root = document.createElement('div')

  root.innerHTML = html
  repeatTableHeaders(root)
  return root
}

describe('repeatTableHeaders', () => {
  it('moves a leading header row into <thead>', () => {
    const root = render('<table><tbody><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></tbody></table>')
    const table = root.querySelector('table') as HTMLTableElement

    expect(table.tHead?.rows[0].textContent).toBe('AB')
    expect(table.tBodies[0].rows).toHaveLength(1)
  })

  it('leaves tables without a header row alone', () => {
    const root = render('<table><tbody><tr><td>1</td></tr><tr><td>2</td></tr></tbody></table>')

    expect(root.querySelector('thead')).toBeNull()
  })

  it('does not repeat a header joined to the next row by a rowspan', () => {
    const root = render('<table><tbody><tr><th rowspan="2">A</th><th>B</th></tr><tr><td>2</td></tr></tbody></table>')

    expect(root.querySelector('thead')).toBeNull()
  })
})
