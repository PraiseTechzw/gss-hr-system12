"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
// Supabase client removed

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h]
      if (v === null || v === undefined) return ''
      const s = String(v)
      return (s.includes(',') || s.includes('"')) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(','))
  ].join('\n')
  return csv
}

export function ExportTableButton({ table, className }: { table: string; className?: string }) {
  const supabase = createClient()

  const handleClick = async () => {
    const { data } = await supabase.from(table).select("*")
    const csv = toCSV(data || [])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${table}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleClick} className={className}>
      <Download className="mr-2 h-4 w-4" /> Export
    </Button>
  )
}


