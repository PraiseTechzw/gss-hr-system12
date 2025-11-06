import { NextResponse } from 'next/server'
import type { MetadataRoute } from 'next'

export async function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: "GSS HR & Payroll Management System",
    short_name: "GSS HRMS",
    description: "GSS HR & Payroll Management System",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#150057",
    lang: "en",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/logo.png", 
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}

