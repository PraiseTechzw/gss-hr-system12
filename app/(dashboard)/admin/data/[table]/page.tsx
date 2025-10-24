import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminDataBrowser({ params }: { params: { table: string } }) {
  const supabase = await createClient()
  const table = params.table
  const { data, error } = await supabase.from(table).select("*").limit(200)
  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>
  }
  const rows = data || []
  const headers = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Data • {table}</h1>
        <Link href="/settings/system">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{rows.length} rows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r: any, idx: number) => (
                  <TableRow key={idx}>
                    {headers.map((h) => (
                      <TableCell key={h}>{typeof r[h] === 'object' ? JSON.stringify(r[h]) : String(r[h] ?? '')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



