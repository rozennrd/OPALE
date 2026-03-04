import PDFDocument from 'pdfkit'
import axios from 'axios'

type ExportStep = {
    text?: string
    subSteps?: string[]
    imageUrl?: string
    imageAlt?: string
    imageCaption?: string
}

type ExportSection = {
    title: string
    steps: ExportStep[]
}

type ExportTutorial = {
    id: string
    title: string
    summary?: string
    objective?: string
    expectedResult?: string
    tips?: string[]
    steps?: ExportStep[]
    stepSections?: ExportSection[]
}

export type ExportPayload = {
    title?: string
    date?: string
    logoUrl?: string
    tutorials: ExportTutorial[]
}

type TocLayout = {
    pages: number
    linesPerPage: number
    lineHeight: number
    titleHeight: number
}

type PdfDoc = PDFKit.PDFDocument

const fetchImageBuffer = async (url: string, timeoutMs = 10000): Promise<Buffer> => {
    const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: timeoutMs,
    })
    return Buffer.from(response.data)
}

const normalizeText = (value?: string): string => {
    if (!value) {
        return ''
    }

    return value.replace(/\s+/g, ' ').trim()
}

const computeTocLayout = (doc: PdfDoc, entryCount: number): TocLayout => {
    const lineHeight = 18
    const titleHeight = 28
    const availableHeight =
        doc.page.height - doc.page.margins.top - doc.page.margins.bottom - titleHeight - 12
    const linesPerPage = Math.max(1, Math.floor(availableHeight / lineHeight))
    const pages = Math.max(1, Math.ceil(entryCount / linesPerPage))

    return {
        pages,
        linesPerPage,
        lineHeight,
        titleHeight,
    }
}

const renderCover = async (
    doc: PdfDoc,
    payload: ExportPayload,
    getImage: (url: string) => Promise<Buffer | null>,
) => {
    const logoBuffer = payload.logoUrl ? await getImage(payload.logoUrl) : null
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right

    if (logoBuffer) {
        const logoWidth = Math.min(220, pageWidth)
        const logoX = doc.page.margins.left + (pageWidth - logoWidth) / 2
        doc.image(logoBuffer, logoX, doc.page.margins.top, { width: logoWidth })
        doc.moveDown(6)
    }

    doc
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor('#111111')
        .text(normalizeText(payload.title) || 'Documentation OPALE', {
            align: 'center',
        })

    doc.moveDown(0.6)
    doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#444444')
        .text(normalizeText(payload.date) || new Date().toLocaleDateString('fr-FR'), {
            align: 'center',
        })
}

const renderToc = (
    doc: PdfDoc,
    layout: TocLayout,
    entries: { title: string; page: number }[],
    tocPages: number[],
) => {
    let entryIndex = 0
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const pageNumberWidth = 40
    const titleWidth = pageWidth - pageNumberWidth - 8

    tocPages.forEach((pageNumber) => {
        doc.switchToPage(pageNumber - 1)
        doc
            .font('Helvetica-Bold')
            .fontSize(20)
            .fillColor('#111111')
            .text('Sommaire', doc.page.margins.left, doc.page.margins.top)

        let y =
            doc.page.margins.top +
            layout.titleHeight

        doc.font('Helvetica').fontSize(12).fillColor('#111111')

        for (let i = 0; i < layout.linesPerPage && entryIndex < entries.length; i += 1) {
            const entry = entries[entryIndex]
            const lineY = y + i * layout.lineHeight

            doc.text(entry.title, doc.page.margins.left, lineY, {
                width: titleWidth,
            })
            doc.text(String(entry.page), doc.page.margins.left + titleWidth + 8, lineY, {
                width: pageNumberWidth,
                align: 'right',
            })
            entryIndex += 1
        }

    })
}

const renderTextBlock = (doc: PdfDoc, title: string, text?: string) => {
    const normalized = normalizeText(text)
    if (!normalized) {
        return
    }

    doc.moveDown(0.7)
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111111').text(title.toUpperCase())
    doc.moveDown(0.3)
    doc.font('Helvetica').fontSize(11).fillColor('#111111').text(normalized, {
        paragraphGap: 4,
    })
}

const renderBulletList = (doc: PdfDoc, items?: string[]) => {
    if (!items || items.length === 0) {
        return
    }

    items
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .forEach((item) => {
            doc.font('Helvetica').fontSize(11).fillColor('#111111').text(`- ${item}`, {
                indent: 12,
                paragraphGap: 4,
            })
        })
}

const renderSteps = async (
    doc: PdfDoc,
    steps: ExportStep[],
    getImage: (url: string) => Promise<Buffer | null>,
) => {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const maxImageWidth = pageWidth

    for (let i = 0; i < steps.length; i += 1) {
        const step = steps[i]
        const text = normalizeText(step.text)

        if (text) {
            doc.font('Helvetica').fontSize(11).fillColor('#111111').text(`${i + 1}. ${text}`, {
                paragraphGap: 4,
            })
        }

        if (step.subSteps && step.subSteps.length > 0) {
            step.subSteps
                .map((subStep) => normalizeText(subStep))
                .filter(Boolean)
                .forEach((subStep) => {
                    doc.text(`- ${subStep}`, {
                        indent: 18,
                        paragraphGap: 4,
                    })
                })
        }

        if (step.imageUrl) {
            const imageBuffer = await getImage(step.imageUrl)
            if (imageBuffer) {
                doc.moveDown(0.4)
                doc.image(imageBuffer, {
                    width: maxImageWidth,
                })
                doc.moveDown(0.2)
            }

            if (step.imageCaption) {
                doc
                    .font('Helvetica')
                    .fontSize(9)
                    .fillColor('#444444')
                    .text(step.imageCaption, {
                        align: 'center',
                        paragraphGap: 6,
                    })
            }
        }

        doc.moveDown(0.3)
    }
}

const renderTutorial = async (
    doc: PdfDoc,
    tutorial: ExportTutorial,
    getImage: (url: string) => Promise<Buffer | null>,
) => {
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#111111').text(tutorial.title)
    doc.moveDown(0.4)

    if (tutorial.summary) {
        doc.font('Helvetica').fontSize(11).fillColor('#111111').text(tutorial.summary, {
            paragraphGap: 6,
        })
    }

    renderTextBlock(doc, 'Objectif', tutorial.objective)
    renderTextBlock(doc, 'Resultat attendu', tutorial.expectedResult)

    if (tutorial.tips && tutorial.tips.length > 0) {
        doc.moveDown(0.7)
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#111111').text("POINTS D'ATTENTION")
        doc.moveDown(0.3)
        renderBulletList(doc, tutorial.tips)
    }

    if (tutorial.stepSections && tutorial.stepSections.length > 0) {
        doc.moveDown(0.8)
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111').text('FONCTIONNALITES')
        for (const section of tutorial.stepSections) {
            doc.moveDown(0.6)
            doc.font('Helvetica-Bold').fontSize(11).fillColor('#111111').text(section.title)
            await renderSteps(doc, section.steps, getImage)
        }
    } else if (tutorial.steps && tutorial.steps.length > 0) {
        doc.moveDown(0.8)
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111').text('ETAPES')
        await renderSteps(doc, tutorial.steps, getImage)
    }
}

export const generateTutorialPdf = async (payload: ExportPayload): Promise<Buffer> => {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
    })

    const buffers: Buffer[] = []
    const output = new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk) => buffers.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', (error) => reject(error))
    })

    const imageCache = new Map<string, Buffer | null>()
    const getImage = async (url: string): Promise<Buffer | null> => {
        if (imageCache.has(url)) {
            return imageCache.get(url) ?? null
        }
        try {
            const buffer = await fetchImageBuffer(url)
            imageCache.set(url, buffer)
            return buffer
        } catch (error) {
            console.error('Image fetch failed', url, error)
            imageCache.set(url, null)
            return null
        }
    }

    let currentPageNumber = 1

    await renderCover(doc, payload, getImage)

    const tocLayout = computeTocLayout(doc, payload.tutorials.length)
    const tocPages: number[] = []
    for (let i = 0; i < tocLayout.pages; i += 1) {
        doc.addPage()
        currentPageNumber += 1
        tocPages.push(currentPageNumber)
    }

    const tocEntries: { title: string; page: number }[] = []

    for (const tutorial of payload.tutorials) {
        doc.addPage()
        currentPageNumber += 1
        tocEntries.push({ title: tutorial.title, page: currentPageNumber })
        await renderTutorial(doc, tutorial, getImage)
    }

    renderToc(doc, tocLayout, tocEntries, tocPages)

    doc.end()
    return output
}
