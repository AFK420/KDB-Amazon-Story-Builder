import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { storyData, settings } = await req.json()

    // Generate PDF content (simplified for demo)
    const pdfContent = generatePDFContent(storyData, settings)

    const pdfBlob = new Blob([pdfContent], { type: "application/pdf" })

    return new Response(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${storyData.title || "Novel"}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error exporting PDF:", error)
    return Response.json({ error: "Failed to export PDF" }, { status: 500 })
  }
}

function generatePDFContent(storyData: any, settings: any): string {
  // This is a simplified PDF structure
  // In a real implementation, you would use a proper PDF library like jsPDF or puppeteer

  let content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [`

  // Add page references for each chapter
  for (let i = 0; i < storyData.chapters.length; i++) {
    content += `${3 + i} 0 R `
  }

  content += `]
/Count ${storyData.chapters.length}
>>
endobj

`

  // Generate pages for each chapter
  storyData.chapters.forEach((chapter: any, index: number) => {
    const pageNum = 3 + index
    const contentNum = pageNum + storyData.chapters.length

    content += `${pageNum} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${contentNum} 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

`
  })

  // Add font definition
  content += `5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /${settings.primaryFont.replace(/\s+/g, "-") || "Times-Roman"}
>>
endobj

`

  // Add content streams for each chapter
  storyData.chapters.forEach((chapter: any, index: number) => {
    const contentNum = 3 + storyData.chapters.length + index
    const chapterText = `Chapter ${chapter.chapterNumber}: ${chapter.title}\n\n${chapter.content}`

    content += `${contentNum} 0 obj
<<
/Length ${chapterText.length + 100}
>>
stream
BT
/F1 ${settings.fontSize || 12} Tf
50 750 Td
(${chapterText.replace(/[()\\]/g, "\\$&").substring(0, 1000)}) Tj
ET
endstream
endobj

`
  })

  // Add cross-reference table and trailer
  content += `xref
0 ${6 + storyData.chapters.length * 2}
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
trailer
<<
/Size ${6 + storyData.chapters.length * 2}
/Root 1 0 R
>>
startxref
${content.length}
%%EOF`

  return content
}
