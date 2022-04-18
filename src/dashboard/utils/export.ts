import type { WorkBook, WorkSheet } from 'xlsx'
import { utils, writeFile } from 'xlsx'

export const exportTypes: string[] = ['xlsx', 'xlsb', 'csv', 'html']
export const exportFile = (data: any[], columns: [], type = 'xlsx'): void => {
  function SelectedHistoryCols(cols, row): any {
    for (const [key, value] of Object.entries(cols))
      this[key] = row[value]
  }

  const objectCols = {}
  columns.filter(col => !col.isHidden && !(['operation'].includes(col.key))).map(({ title, key }) => {
    objectCols[title] = key
  })

  const filteredData: any = data.map((row: any) => new SelectedHistoryCols(objectCols, row))

  const ws: WorkSheet = utils.json_to_sheet(filteredData)
  const wb: WorkBook = utils.book_new()
  utils.book_append_sheet(wb, ws, `export_${useDateFormat(useNow(), 'YYYY_MM_DD').value}`)

  writeFile(wb, `sheet_${useDateFormat(useNow(), 'YYYY_MM_DD').value}.${type}`)
}
