import { Request, Response } from 'express'
import { ExportPayload, generateTutorialPdf } from '../../pdf/tutorialExport'

const isValidPayload = (payload: ExportPayload): boolean => {
    if (!payload || !Array.isArray(payload.tutorials)) {
        return false
    }

    return payload.tutorials.length > 0
}

export const exportDocumentationPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.body as ExportPayload

        if (!isValidPayload(payload)) {
            res.status(400).json({
                error: 'Aucun tutoriel selectionne pour l export PDF.',
            })
            return
        }

        const pdfBuffer = await generateTutorialPdf(payload)
        const filename = 'OPALE-tutoriels.pdf'

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.status(200).send(pdfBuffer)
        return
    } catch (error) {
        // Conservé: utile pour diagnostiquer un échec serveur lors de la génération du PDF.
        console.error('[PDF] Export failed', error)
        res.status(500).json({
            error: 'Erreur lors de la generation du PDF.',
        })
        return
    }
}
