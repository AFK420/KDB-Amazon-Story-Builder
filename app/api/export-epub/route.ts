import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { storyData, settings } = await req.json()

    // Generate EPUB content (simplified for demo)
    const epubContent = generateEPUBContent(storyData, settings)

    const epubBlob = new Blob([epubContent], { type: "application/epub+zip" })

    return new Response(epubBlob, {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${storyData.title || "Novel"}.epub"`,
      },
    })
  } catch (error) {
    console.error("Error exporting EPUB:", error)
    return Response.json({ error: "Failed to export EPUB" }, { status: 500 })
  }
}

function generateEPUBContent(storyData: any, settings: any): string {
  // This is a simplified EPUB structure
  // In a real implementation, you would use a proper EPUB library
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${storyData.title}</dc:title>
    <dc:creator>${storyData.author || "Unknown Author"}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">${Date.now()}</dc:identifier>
  </metadata>
  <manifest>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${storyData.chapters
      .map(
        (chapter: any, index: number) =>
          `<item id="chapter${index + 1}" href="chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`,
      )
      .join("\n    ")}
  </manifest>
  <spine>
    ${storyData.chapters.map((chapter: any, index: number) => `<itemref idref="chapter${index + 1}"/>`).join("\n    ")}
  </spine>
</package>`

  return content
}
