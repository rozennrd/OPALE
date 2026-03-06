import PDFDocument from 'pdfkit'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

type ExportStep = {
    text?: RichTextLine | string
    subSteps?: RichTextLine[] | string[]
    imageUrl?: string
    imageData?: string
    imageAlt?: string
    imageCaption?: string
    imageHighlights?: ExportImageHighlight[]
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

type RichTextSpan = {
    text: string
    bold?: boolean
    underline?: boolean
    link?: string
}

type RichTextLine = RichTextSpan[]

type ExportImageHighlight = {
    left: string
    top: string
    width: string
    height: string
    label?: string
    labelLeft?: string
    labelTop?: string
}

export type ExportPayload = {
    title?: string
    date?: string
    logoUrl?: string
    logoData?: string
    theme?: 'light' | 'dark'
    tutorials: ExportTutorial[]
}

type TocLayout = {
    pages: number
    linesPerPage: number
    rowHeight: number
    rowGap: number
    titleHeight: number
}

type PdfDoc = PDFKit.PDFDocument
type PdfDocWithDest = PdfDoc & {
    addNamedDestination?: (name: string, ...args: unknown[]) => void
}

type ThemeName = 'light' | 'dark'

type ThemeColors = {
    text: string
    muted: string
    primary: string
    primaryDark: string
    brand: string
    panel: string
    border: string
    white: string
    tipsPanel: string
    tipsBorder: string
    imagePanel: string
    overlay: string
    page: string
}

const LIGHT_COLORS: ThemeColors = {
    text: '#111827',
    muted: '#6b7280',
    primary: '#93c7a6',
    primaryDark: '#0b3b24',
    brand: '#2cd4d9',
    panel: '#f7f7f7',
    border: '#e5e7eb',
    white: '#ffffff',
    tipsPanel: '#e7f7ee',
    tipsBorder: '#9edcb7',
    imagePanel: '#ffffff',
    overlay: '#09111f',
    page: '#ffffff',
}

const DARK_COLORS: ThemeColors = {
    text: '#f8fafc',
    muted: '#cbd5e1',
    primary: '#93c7a6',
    primaryDark: '#0a2c1b',
    brand: '#2cd4d9',
    panel: '#1f2937',
    border: '#334155',
    white: '#ffffff',
    tipsPanel: '#0f2a1f',
    tipsBorder: '#1d6b4a',
    imagePanel: '#111827',
    overlay: '#000000',
    page: '#0f172a',
}

const getThemeColors = (theme?: ThemeName): ThemeColors =>
    theme === 'dark' ? DARK_COLORS : LIGHT_COLORS

const ARIAL_REGULAR_PATH = path.resolve(__dirname, 'fonts', 'arial.ttf')
const ARIAL_BOLD_PATH = path.resolve(__dirname, 'fonts', 'arialbd.ttf')
const HAS_ARIAL_FONTS = fs.existsSync(ARIAL_REGULAR_PATH) && fs.existsSync(ARIAL_BOLD_PATH)

const FONTS = HAS_ARIAL_FONTS
    ? ({
          regular: 'Arial',
          bold: 'Arial-Bold',
      } as const)
    : ({
          regular: 'Helvetica',
          bold: 'Helvetica-Bold',
      } as const)

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
    colors: ThemeColors,
    options?: { fill?: string; stroke?: string; radius?: number },
) => {
    const { fill = colors.panel, stroke = colors.border, radius = 10 } = options ?? {}
    doc.save()
    doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke)
    doc.restore()
}

const drawSectionLabel = (doc: PdfDoc, label: string, colors: ThemeColors) => {
    const startX = doc.page.margins.left
    const labelHeight = 18
    ensureSpace(doc, labelHeight + SPACING.sm)
    doc
        .font(FONTS.bold)
        .fontSize(10)
        .fillColor(colors.muted)
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

const fillPageBackground = (doc: PdfDoc, colors: ThemeColors) => {
    doc.save()
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.page)
    doc.restore()
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
    } catch (error) {
        console.warn('[PDF] Invalid image URL', {
            url,
            message: error instanceof Error ? error.message : String(error),
        })
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

const mergeRichTextSpans = (spans: RichTextSpan[]): RichTextSpan[] => {
    const merged: RichTextSpan[] = []

    spans.forEach((span) => {
        if (!span.text) {
            return
        }
        const last = merged[merged.length - 1]
        if (
            last &&
            last.bold === span.bold &&
            last.underline === span.underline &&
            last.link === span.link
        ) {
            last.text += span.text
        } else {
            merged.push({ ...span })
        }
    })

    return merged
}

const normalizeRichText = (value?: RichTextLine | string): RichTextLine => {
    if (!value) {
        return []
    }

    if (typeof value === 'string') {
        return [{ text: value }]
    }

    return mergeRichTextSpans(value).filter((span) => span.text.length > 0)
}

const hasRichText = (spans: RichTextLine): boolean =>
    spans.some((span) => span.text.trim().length > 0)

const normalizeRichTextLines = (value?: RichTextLine[] | string[]): RichTextLine[] => {
    if (!value || value.length === 0) {
        return []
    }

    if (typeof value[0] === 'string') {
        return (value as string[]).map((line) => normalizeRichText(line))
    }

    return (value as RichTextLine[]).map((line) => normalizeRichText(line))
}

const richTextToPlainText = (spans: RichTextLine): string =>
    spans.map((span) => span.text).join('')

const parseHighlightValue = (value: string | number | undefined, reference: number): number => {
    if (value === undefined || value === null) {
        return 0
    }

    if (typeof value === 'number') {
        return value
    }

    const trimmed = value.trim()
    if (!trimmed) {
        return 0
    }

    if (trimmed.endsWith('%')) {
        const percent = Number.parseFloat(trimmed)
        return Number.isNaN(percent) ? 0 : (percent / 100) * reference
    }

    if (trimmed.endsWith('rem')) {
        const remValue = Number.parseFloat(trimmed)
        return Number.isNaN(remValue) ? 0 : remValue * 16
    }

    const parsed = Number.parseFloat(trimmed)
    return Number.isNaN(parsed) ? 0 : parsed
}

const drawImageHighlights = (
    doc: PdfDoc,
    imageBuffer: Buffer,
    imageX: number,
    imageY: number,
    imageWidth: number,
    imageHeight: number,
    highlights: ExportImageHighlight[],
    colors: ThemeColors,
) => {
    if (highlights.length === 0) {
        return
    }

    doc.save()
    doc.fillColor(colors.overlay)
    doc.opacity(0.42)
    doc.rect(imageX, imageY, imageWidth, imageHeight).fill()
    doc.restore()

    highlights.forEach((highlight) => {
        const highlightX = imageX + parseHighlightValue(highlight.left, imageWidth)
        const highlightY = imageY + parseHighlightValue(highlight.top, imageHeight)
        const highlightWidth = parseHighlightValue(highlight.width, imageWidth)
        const highlightHeight = parseHighlightValue(highlight.height, imageHeight)

        if (highlightWidth <= 0 || highlightHeight <= 0) {
            return
        }

        doc.save()
        doc.rect(highlightX, highlightY, highlightWidth, highlightHeight).clip()
        doc.image(imageBuffer, imageX, imageY, { width: imageWidth })
        doc.restore()

        const radius = Math.min(10, Math.min(highlightWidth, highlightHeight) / 6)
        doc.save()
        doc.lineWidth(2)
        doc.strokeColor(colors.primary)
        doc.roundedRect(highlightX, highlightY, highlightWidth, highlightHeight, radius).stroke()
        if (highlightWidth > 4 && highlightHeight > 4) {
            doc.lineWidth(1)
            doc.strokeColor(colors.white)
            doc.roundedRect(
                highlightX + 1,
                highlightY + 1,
                highlightWidth - 2,
                highlightHeight - 2,
                Math.max(2, radius - 1),
            ).stroke()
        }
        doc.restore()

        if (highlight.label) {
            doc.save()
            doc.font(FONTS.bold).fontSize(9)
            const labelPaddingX = 6
            const labelPaddingY = 3
            const labelWidth = doc.widthOfString(highlight.label) + labelPaddingX * 2
            const labelHeight = doc.currentLineHeight(false) + labelPaddingY * 2
            const labelOffsetX = highlight.labelLeft
                ? parseHighlightValue(highlight.labelLeft, highlightWidth)
                : 7
            const labelBaseY = highlight.labelTop
                ? highlightY + parseHighlightValue(highlight.labelTop, highlightHeight)
                : highlightY - 6
            const labelX = highlightX + labelOffsetX
            const labelY = labelBaseY - labelHeight

            doc.fillColor(colors.panel)
            doc.roundedRect(labelX, labelY, labelWidth, labelHeight, 10).fill()
            doc.strokeColor(colors.border)
            doc.lineWidth(1)
            doc.roundedRect(labelX, labelY, labelWidth, labelHeight, 10).stroke()
            doc.fillColor(colors.text)
            doc.text(highlight.label, labelX + labelPaddingX, labelY + labelPaddingY, {
                width: labelWidth - labelPaddingX * 2,
            })
            doc.restore()
        }
    })
}

const renderRichTextLine = (
    doc: PdfDoc,
    spans: RichTextLine,
    x: number,
    y: number,
    width: number,
    options?: PDFKit.Mixins.TextOptions,
) => {
    const cleaned = normalizeRichText(spans)
    if (cleaned.length === 0) {
        return
    }

    cleaned.forEach((span, index) => {
        const isLast = index === cleaned.length - 1
        doc.font(span.bold ? FONTS.bold : FONTS.regular)
        if (index === 0) {
            doc.text(span.text, x, y, {
                ...options,
                width,
                continued: !isLast,
                underline: span.underline,
                link: span.link,
            })
        } else {
            doc.text(span.text, {
                ...options,
                width,
                continued: !isLast,
                underline: span.underline,
                link: span.link,
            })
        }
    })
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
    doc.font(FONTS.regular).fontSize(12)
    const rowHeight = Math.max(26, doc.currentLineHeight(true) + 6)
    const rowGap = 6
    const titleHeight = 28
    const availableHeight =
        doc.page.height - doc.page.margins.top - doc.page.margins.bottom - titleHeight - 12
    const linesPerPage = Math.max(1, Math.floor(availableHeight / (rowHeight + rowGap)))
    const pages = Math.max(1, Math.ceil(entryCount / linesPerPage))

    return {
        pages,
        linesPerPage,
        rowHeight,
        rowGap,
        titleHeight,
    }
}

const renderCover = async (
    doc: PdfDoc,
    payload: ExportPayload,
    getImage: (url: string) => Promise<Buffer | null>,
    colors: ThemeColors,
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
        .font(FONTS.bold)
        .fontSize(26)
        .fillColor(colors.text)
        .text(normalizeText(payload.title) || 'Documentation OPALE', {
            align: 'center',
        })

    doc.moveDown(0.6)
    doc
        .font(FONTS.regular)
        .fontSize(12)
        .fillColor(colors.muted)
        .text(normalizeText(payload.date) || new Date().toLocaleDateString('fr-FR'), {
            align: 'center',
        })

    doc.moveDown(2)
    const ribbonY = doc.y
    const ribbonHeight = 36
    drawCard(doc, doc.page.margins.left, ribbonY, pageWidth, ribbonHeight, colors, {
        fill: colors.brand,
        stroke: colors.brand,
        radius: 14,
    })
    doc.font(FONTS.bold).fontSize(12).fillColor(colors.primaryDark)
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
    entries: { title: string; page: number; destination: string }[],
    tocPages: number[],
    colors: ThemeColors,
) => {
    let entryIndex = 0
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const rowPadding = 12
    const pageNumberWidth = 36
    const titleWidth = pageWidth - pageNumberWidth - rowPadding * 2
    const rowHeight = layout.rowHeight

    tocPages.forEach((pageNumber) => {
        doc.switchToPage(pageNumber - 1)
        doc.x = doc.page.margins.left
        doc.y = doc.page.margins.top
        doc.font(FONTS.bold).fontSize(20).fillColor(colors.text).text('Sommaire')

        let y =
            doc.page.margins.top +
            layout.titleHeight

        doc.font(FONTS.regular).fontSize(12).fillColor(colors.text)

        for (let i = 0; i < layout.linesPerPage && entryIndex < entries.length; i += 1) {
            const entry = entries[entryIndex]
            const rowY = y + i * (layout.rowHeight + layout.rowGap)
            drawCard(doc, doc.page.margins.left, rowY, pageWidth, rowHeight, colors, {
                fill: colors.panel,
                stroke: colors.border,
                radius: 8,
            })
            doc.fillColor(colors.text)
            drawCenteredText(doc, entry.title, doc.page.margins.left + rowPadding, rowY, titleWidth, rowHeight, {
                goTo: entry.destination,
            })
            const pageLabel = String(entry.page)
            doc.fillColor(colors.muted)
            drawCenteredText(
                doc,
                pageLabel,
                doc.page.margins.left + pageWidth - pageNumberWidth - rowPadding,
                rowY,
                pageNumberWidth,
                rowHeight,
                { align: 'right', goTo: entry.destination },
            )
            entryIndex += 1
        }

    })
}

const renderTextBlock = (doc: PdfDoc, title: string, text: string | undefined, colors: ThemeColors) => {
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
    drawCard(doc, doc.page.margins.left, startY, contentWidth, cardHeight, colors)

    const startX = doc.page.margins.left + SPACING.md
    let cursorY = startY + SPACING.sm
    doc.font(FONTS.bold).fontSize(10).fillColor(colors.muted).text(title.toUpperCase(), startX, cursorY)
    cursorY += titleHeight + SPACING.xs
    doc.font(FONTS.regular).fontSize(11).fillColor(colors.text).text(normalized, startX, cursorY, {
        width: contentWidth - SPACING.lg,
    })
    doc.y = startY + cardHeight + SPACING.sm
}

const renderBulletList = (doc: PdfDoc, items: string[] | undefined, colors: ThemeColors) => {
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
    drawCard(doc, doc.page.margins.left, startY, contentWidth, cardHeight, colors, {
        fill: colors.tipsPanel,
        stroke: colors.tipsBorder,
        radius: 10,
    })

    const startX = doc.page.margins.left + SPACING.md
    const cursorY = startY + (cardHeight - textHeight) / 2
    doc.font(FONTS.regular).fontSize(11).fillColor(colors.text).text(bulletText, startX, cursorY, {
        width: contentWidth - SPACING.lg,
        lineGap,
    })
    doc.y = startY + cardHeight + SPACING.sm
}

const renderSteps = async (
    doc: PdfDoc,
    steps: ExportStep[],
    getImage: (url: string) => Promise<Buffer | null>,
    colors: ThemeColors,
) => {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const maxImageWidth = pageWidth

    for (let i = 0; i < steps.length; i += 1) {
        const step = steps[i]
        const textSpans = normalizeRichText(step.text)
        const circleSize = 18
        const startX = doc.page.margins.left
        const textX = startX + circleSize + 8
        const textWidth = getContentWidth(doc) - circleSize - 8

        if (hasRichText(textSpans)) {
            doc.font(FONTS.regular).fontSize(11).fillColor(colors.text)
            const textHeight = doc.heightOfString(richTextToPlainText(textSpans), { width: textWidth })
            ensureSpace(doc, textHeight + circleSize + SPACING.sm)

            const textY = doc.y
            const lineHeight = doc.currentLineHeight(false)
            const circleY = textY + lineHeight / 2 - circleSize / 2
            doc
                .save()
                .fillColor(colors.primary)
                .circle(startX + circleSize / 2, circleY + circleSize / 2, circleSize / 2)
                .fill()
                .restore()
            const stepLabel = String(i + 1)
            doc.font(FONTS.bold).fontSize(9).fillColor(colors.primaryDark)
            drawCenteredCapText(doc, stepLabel, startX, circleY, circleSize, circleSize, { align: 'center' })
            doc.font(FONTS.regular).fontSize(11).fillColor(colors.text)
            renderRichTextLine(doc, textSpans, textX, textY, textWidth)
            const rowHeight = Math.max(circleSize, doc.y - textY)
            doc.y = textY + rowHeight + SPACING.sm
        }

        const subSteps = normalizeRichTextLines(step.subSteps)
        if (subSteps.length > 0) {
            subSteps
                .filter((subStep) => hasRichText(subStep))
                .forEach((subStep) => {
                    const bulletSpans: RichTextLine = [{ text: '- ' }, ...subStep]
                    renderRichTextLine(doc, bulletSpans, textX, doc.y, textWidth, {
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
                    colors,
                    {
                        fill: colors.imagePanel,
                        stroke: colors.border,
                        radius: 10,
                    },
                )
                const imageX = doc.page.margins.left + (maxImageWidth - renderedWidth) / 2
                const imageY = imageCardY + SPACING.sm
                doc.image(imageBuffer, imageX, imageY, {
                    width: renderedWidth,
                })

                if (step.imageHighlights && step.imageHighlights.length > 0) {
                    drawImageHighlights(
                        doc,
                        imageBuffer,
                        imageX,
                        imageY,
                        renderedWidth,
                        renderedHeight,
                        step.imageHighlights,
                        colors,
                    )
                }
                doc.y = imageCardY + imageCardHeight + SPACING.sm
            }

            if (step.imageCaption) {
                doc
                    .font(FONTS.regular)
                    .fontSize(9)
                    .fillColor(colors.muted)
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
    colors: ThemeColors,
) => {
    doc
        .font(FONTS.bold)
        .fontSize(18)
        .fillColor(colors.text)
        .text(tutorial.title)
    doc.moveDown(0.3)

    if (tutorial.summary) {
        doc.font(FONTS.regular).fontSize(11).fillColor(colors.muted).text(tutorial.summary, {
            paragraphGap: 6,
        })
    }

    doc.moveDown(0.2)
    renderTextBlock(doc, 'Objectif', tutorial.objective, colors)
    renderTextBlock(doc, 'Resultat attendu', tutorial.expectedResult, colors)

    if (tutorial.tips && tutorial.tips.length > 0) {
        drawSectionLabel(doc, "Points d'attention", colors)
        renderBulletList(doc, tutorial.tips, colors)
    }

    if (tutorial.stepSections && tutorial.stepSections.length > 0) {
        drawSectionLabel(doc, 'Fonctionnalites', colors)
        for (const section of tutorial.stepSections) {
            doc.moveDown(0.3)
            doc.font(FONTS.bold).fontSize(12).fillColor(colors.text).text(section.title)
            await renderSteps(doc, section.steps, getImage, colors)
        }
    } else if (tutorial.steps && tutorial.steps.length > 0) {
        drawSectionLabel(doc, 'Etapes', colors)
        await renderSteps(doc, tutorial.steps, getImage, colors)
    }
}

export const generateTutorialPdf = async (payload: ExportPayload): Promise<Buffer> => {
    const colors = getThemeColors(payload.theme)
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
    })
    if (HAS_ARIAL_FONTS) {
        doc.registerFont(FONTS.regular, ARIAL_REGULAR_PATH)
        doc.registerFont(FONTS.bold, ARIAL_BOLD_PATH)
    }
    fillPageBackground(doc, colors)
    doc.on('pageAdded', () => fillPageBackground(doc, colors))

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

    await renderCover(doc, payload, getImage, colors)

    const tocLayout = computeTocLayout(doc, payload.tutorials.length)
    const tocPages: number[] = []
    for (let i = 0; i < tocLayout.pages; i += 1) {
        doc.addPage()
        currentPageNumber += 1
        tocPages.push(currentPageNumber)
    }

    const tocEntries: { title: string; page: number; destination: string }[] = []

    for (const [index, tutorial] of payload.tutorials.entries()) {
        doc.addPage()
        currentPageNumber += 1
        const destination = `tuto-${index + 1}`
        ;(doc as PdfDocWithDest).addNamedDestination?.(
            destination,
            'XYZ',
            doc.page.margins.left,
            doc.page.margins.top,
            null,
        )
        tocEntries.push({ title: tutorial.title, page: currentPageNumber, destination })
        await renderTutorial(doc, tutorial, getImage, colors)

        const pageRange = (doc as unknown as { bufferedPageRange?: () => { start: number; count: number } })
            .bufferedPageRange?.()
        if (pageRange) {
            currentPageNumber = pageRange.start + pageRange.count - 1
        }
    }

    renderToc(doc, tocLayout, tocEntries, tocPages, colors)

    doc.end()
    return output
}
