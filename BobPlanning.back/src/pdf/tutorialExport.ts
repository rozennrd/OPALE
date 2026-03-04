import PDFDocument from 'pdfkit'
import axios from 'axios'

type ExportStep = {
    text?: string
    subSteps?: string[]
    imageUrl?: string
    imageData?: string
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
    logoData?: string
    tutorials: ExportTutorial[]
}

type TocLayout = {
    pages: number
    linesPerPage: number
    lineHeight: number
    titleHeight: number
}

type PdfDoc = PDFKit.PDFDocument

const COLORS = {
    text: '#111827',
    muted: '#6b7280',
    primary: '#93c7a6',
    primaryDark: '#0b3b24',
    brand: '#2cd4d9',
    panel: '#f7f7f7',
    border: '#e5e7eb',
    white: '#ffffff',
}

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
}

const getContentWidth = (doc: PdfDoc): number =>
    doc.page.width - doc.page.margins.left - doc.page.margins.right

const ensureSpace = (doc: PdfDoc, height: number) => {
    const bottom = doc.page.height - doc.page.margins.bottom
    if (doc.y + height > bottom) {
        doc.addPage()
    }
}

const drawCard = (
    doc: PdfDoc,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: { fill?: string; stroke?: string; radius?: number },
) => {
    const { fill = COLORS.panel, stroke = COLORS.border, radius = 10 } = options ?? {}
    doc.save()
    doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke)
    doc.restore()
}

const drawSectionLabel = (doc: PdfDoc, label: string) => {
    const startX = doc.page.margins.left
    const labelHeight = 18
    ensureSpace(doc, labelHeight + SPACING.sm)
    doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(COLORS.muted)
        .text(label.toUpperCase(), startX, doc.y)
    doc.moveDown(0.4)
}

const drawCenteredText = (
    doc: PdfDoc,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: PDFKit.Mixins.TextOptions,
) => {
    doc.text(text, x, y + height / 2, {
        ...options,
        width,
        baseline: 'middle',
    })
}

const drawCenteredCapText = (
    doc: PdfDoc,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: PDFKit.Mixins.TextOptions,
) => {
    const font = (doc as unknown as { _font?: { capHeight?: number; ascender?: number } })._font
    const fontSize = (doc as unknown as { _fontSize?: number })._fontSize ?? 0
    const capHeight = (font?.capHeight ?? font?.ascender ?? 0) / 1000 * fontSize
    const baselineY = y + height / 2 + capHeight / 2

    doc.text(text, x, baselineY, {
        ...options,
        width,
        baseline: 'alphabetic',
    })
}

const buildImageUrlCandidates = (url: string): string[] => {
    const candidates = [url]
    try {
        const parsed = new URL(url)
        const hostname = parsed.hostname
        const isLocalHost =
            hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0'

        if (isLocalHost) {
            const fallbackHosts = [
                process.env.PDF_ASSET_HOST,
                'opale-new-frontend:5173',
                'host.docker.internal:5173',
            ]
                .filter(Boolean)
                .map(String)

            fallbackHosts.forEach((fallbackHost) => {
                const fallback = new URL(url)
                fallback.host = fallbackHost
                candidates.push(fallback.toString())
            })
        }
    } catch {
        // ignore invalid URLs, return original
    }

    return Array.from(new Set(candidates))
}

const fetchImageBuffer = async (url: string, timeoutMs = 10000): Promise<Buffer> => {
    const candidates = buildImageUrlCandidates(url)
    let lastError: unknown

    for (const candidate of candidates) {
        try {
            const response = await axios.get<ArrayBuffer>(candidate, {
                responseType: 'arraybuffer',
                timeout: timeoutMs,
            })
            return Buffer.from(response.data)
        } catch (error) {
            const status = axios.isAxiosError(error) ? error.response?.status : undefined
            console.warn('[PDF] Image fetch failed', {
                candidate,
                status,
                message: error instanceof Error ? error.message : String(error),
            })
            lastError = error
        }
    }

    throw lastError
}

const normalizeText = (value?: string): string => {
    if (!value) {
        return ''
    }

    return value.replace(/\s+/g, ' ').trim()
}

const decodeDataUrl = (dataUrl?: string): Buffer | null => {
    if (!dataUrl) {
        return null
    }

    const match = /^data:.*?;base64,(.*)$/i.exec(dataUrl)
    if (!match) {
        return null
    }

    try {
        return Buffer.from(match[1], 'base64')
    } catch {
        return null
    }
}

const computeTocLayout = (doc: PdfDoc, entryCount: number): TocLayout => {
    doc.font('Helvetica').fontSize(12)
    const lineHeight = Math.max(24, doc.currentLineHeight(true) + 8)
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
    const logoBuffer =
        decodeDataUrl(payload.logoData) ??
        (payload.logoUrl ? await getImage(payload.logoUrl) : null)
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
        .fillColor(COLORS.text)
        .text(normalizeText(payload.title) || 'Documentation OPALE', {
            align: 'center',
        })

    doc.moveDown(0.6)
    doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor(COLORS.muted)
        .text(normalizeText(payload.date) || new Date().toLocaleDateString('fr-FR'), {
            align: 'center',
        })

    doc.moveDown(2)
    const ribbonY = doc.y
    const ribbonHeight = 36
    drawCard(doc, doc.page.margins.left, ribbonY, pageWidth, ribbonHeight, {
        fill: COLORS.brand,
        stroke: COLORS.brand,
        radius: 14,
    })
    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primaryDark)
    drawCenteredText(
        doc,
        'Guide utilisateur - Export PDF',
        doc.page.margins.left,
        ribbonY,
        pageWidth,
        ribbonHeight,
        { align: 'center' },
    )
    doc.y = ribbonY + ribbonHeight + SPACING.lg
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
    const rowHeight = layout.lineHeight

    tocPages.forEach((pageNumber) => {
        doc.switchToPage(pageNumber - 1)
        doc.x = doc.page.margins.left
        doc.y = doc.page.margins.top
        doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.text).text('Sommaire')

        let y =
            doc.page.margins.top +
            layout.titleHeight

        doc.font('Helvetica').fontSize(12).fillColor(COLORS.text)

        for (let i = 0; i < layout.linesPerPage && entryIndex < entries.length; i += 1) {
            const entry = entries[entryIndex]
            const rowY = y + i * layout.lineHeight
            drawCard(doc, doc.page.margins.left, rowY, pageWidth, rowHeight, {
                fill: COLORS.panel,
                stroke: COLORS.border,
                radius: 8,
            })
            doc.fillColor(COLORS.text)
            drawCenteredText(doc, entry.title, doc.page.margins.left + 8, rowY, titleWidth, rowHeight)
            const pageLabel = String(entry.page)
            doc.fillColor(COLORS.muted)
            drawCenteredText(
                doc,
                pageLabel,
                doc.page.margins.left + titleWidth + 8,
                rowY,
                pageNumberWidth,
                rowHeight,
                { align: 'right' },
            )
            entryIndex += 1
        }

    })
}

const renderTextBlock = (doc: PdfDoc, title: string, text?: string) => {
    const normalized = normalizeText(text)
    if (!normalized) {
        return
    }

    const contentWidth = getContentWidth(doc)
    const titleHeight = doc.heightOfString(title.toUpperCase(), { width: contentWidth - 24 })
    const textHeight = doc.heightOfString(normalized, { width: contentWidth - 24 })
    const cardHeight = titleHeight + textHeight + SPACING.lg

    ensureSpace(doc, cardHeight + SPACING.md)
    const startY = doc.y
    drawCard(doc, doc.page.margins.left, startY, contentWidth, cardHeight)

    const startX = doc.page.margins.left + SPACING.md
    let cursorY = startY + SPACING.sm
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.muted).text(title.toUpperCase(), startX, cursorY)
    cursorY += titleHeight + SPACING.xs
    doc.font('Helvetica').fontSize(11).fillColor(COLORS.text).text(normalized, startX, cursorY, {
        width: contentWidth - SPACING.lg,
    })
    doc.y = startY + cardHeight + SPACING.sm
}

const renderBulletList = (doc: PdfDoc, items?: string[]) => {
    if (!items || items.length === 0) {
        return
    }

    const contentWidth = getContentWidth(doc)
    const normalizedItems = items
        .map((item) => normalizeText(item))
        .filter(Boolean)

    if (normalizedItems.length === 0) {
        return
    }

    const bulletText = normalizedItems.map((item) => `- ${item}`).join('\n')
    const lineGap = 4
    const textHeight = doc.heightOfString(bulletText, {
        width: contentWidth - SPACING.lg,
        lineGap,
    })
    const cardHeight = textHeight + SPACING.lg

    ensureSpace(doc, cardHeight + SPACING.md)
    const startY = doc.y
    drawCard(doc, doc.page.margins.left, startY, contentWidth, cardHeight, {
        fill: '#e7f7ee',
        stroke: '#9edcb7',
        radius: 10,
    })

    const startX = doc.page.margins.left + SPACING.md
    const cursorY = startY + (cardHeight - textHeight) / 2
    doc.font('Helvetica').fontSize(11).fillColor(COLORS.text).text(bulletText, startX, cursorY, {
        width: contentWidth - SPACING.lg,
        lineGap,
    })
    doc.y = startY + cardHeight + SPACING.sm
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
            const circleSize = 18
            const startX = doc.page.margins.left
            const textX = startX + circleSize + 8
            const textWidth = getContentWidth(doc) - circleSize - 8
            const textHeight = doc.heightOfString(text, { width: textWidth })
            ensureSpace(doc, textHeight + circleSize + SPACING.sm)

            const startY = doc.y
            doc
                .save()
                .fillColor(COLORS.primary)
                .circle(startX + circleSize / 2, startY + circleSize / 2, circleSize / 2)
                .fill()
                .restore()
            const stepLabel = String(i + 1)
            doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.primaryDark)
            drawCenteredCapText(doc, stepLabel, startX, startY, circleSize, circleSize, { align: 'center' })
            doc.font('Helvetica').fontSize(11).fillColor(COLORS.text).text(text, textX, startY, {
                width: textWidth,
            })
            const rowHeight = Math.max(circleSize, doc.y - startY)
            doc.y = startY + rowHeight + SPACING.sm
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

        if (step.imageUrl || step.imageData) {
            const imageBuffer =
                decodeDataUrl(step.imageData) ??
                (step.imageUrl ? await getImage(step.imageUrl) : null)
            if (imageBuffer) {
                const imageSize = (doc as unknown as { openImage: (data: Buffer) => { width: number; height: number } })
                    .openImage(imageBuffer)
                const maxHeight = 380
                const scale = Math.min(maxImageWidth / imageSize.width, maxHeight / imageSize.height, 1)
                const renderedWidth = imageSize.width * scale
                const renderedHeight = imageSize.height * scale

                ensureSpace(doc, renderedHeight + SPACING.md)
                const imageCardY = doc.y
                const imageCardHeight = renderedHeight + SPACING.sm * 2
                drawCard(
                    doc,
                    doc.page.margins.left,
                    imageCardY,
                    maxImageWidth,
                    imageCardHeight,
                    {
                        fill: COLORS.white,
                        stroke: COLORS.border,
                        radius: 10,
                    },
                )
                doc.image(imageBuffer, doc.page.margins.left + (maxImageWidth - renderedWidth) / 2, imageCardY + SPACING.sm, {
                    width: renderedWidth,
                })
                doc.y = imageCardY + imageCardHeight + SPACING.sm
            }

            if (step.imageCaption) {
                doc
                    .font('Helvetica')
                    .fontSize(9)
                    .fillColor(COLORS.muted)
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
    doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor(COLORS.text)
        .text(tutorial.title)
    doc.moveDown(0.3)

    if (tutorial.summary) {
        doc.font('Helvetica').fontSize(11).fillColor(COLORS.muted).text(tutorial.summary, {
            paragraphGap: 6,
        })
    }

    doc.moveDown(0.2)
    renderTextBlock(doc, 'Objectif', tutorial.objective)
    renderTextBlock(doc, 'Resultat attendu', tutorial.expectedResult)

    if (tutorial.tips && tutorial.tips.length > 0) {
        drawSectionLabel(doc, "Points d'attention")
        renderBulletList(doc, tutorial.tips)
    }

    if (tutorial.stepSections && tutorial.stepSections.length > 0) {
        drawSectionLabel(doc, 'Fonctionnalites')
        for (const section of tutorial.stepSections) {
            doc.moveDown(0.3)
            doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.text).text(section.title)
            await renderSteps(doc, section.steps, getImage)
        }
    } else if (tutorial.steps && tutorial.steps.length > 0) {
        drawSectionLabel(doc, 'Etapes')
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
