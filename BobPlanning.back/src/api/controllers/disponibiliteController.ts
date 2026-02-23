import { Request, Response } from 'express'
import { disponibiliteService } from '../../domain/services/disponibiliteService'

export const disponibiliteController = {
    async getDisponibilites(req: Request, res: Response): Promise<void> {
        try {
            const list = await disponibiliteService.getDisponibilites()
            res.status(200).json(list)
        } catch (err: any) {
            console.error('Error getDisponibilites:', err)
            res.status(500).json({ error: err.message })
        }
    },

    async getDisponibiliteById(req: Request, res: Response): Promise<void> {
        try {
            const idRaw = req.query?.id ?? req.body?.id
            if (!idRaw || typeof idRaw !== 'string') {
                res.status(400).json({ error: 'Veuillez passer un id (query.id).' })
                return
            }

            const item = await disponibiliteService.getDisponibiliteById(idRaw)
            res.status(200).json(item)
        } catch (err: any) {
            console.error('Error getDisponibiliteById:', err)
            res.status(err.statusCode ?? 500).json({ error: err.message })
        }
    },

    async addDisponibilite(req: Request, res: Response): Promise<void> {
        try {
            const result = await disponibiliteService.addDisponibilite(req.body)
            res.status(201).json({
                message: 'Disponibilité ajoutée avec succès',
                insertedId: result.id,
            })
        } catch (err: any) {
            console.error('Error addDisponibilite:', err)
            res.status(err.statusCode ?? 500).json({ error: err.message })
        }
    },

    async updateDisponibilite(req: Request, res: Response): Promise<void> {
        try {
            await disponibiliteService.updateDisponibilite(req.body)
            res.status(200).json({
                message: 'Disponibilité mise à jour avec succès',
            })
        } catch (err: any) {
            console.error('Error updateDisponibilite:', err)
            res.status(err.statusCode ?? 500).json({ error: err.message })
        }
    },

    async deleteDisponibilite(req: Request, res: Response): Promise<void> {
        try {
            const idRaw = req.body?.id ?? req.query?.id
            if (!idRaw || typeof idRaw !== 'string') {
                res.status(400).json({
                    error: "L'id est requis (body.id ou query.id).",
                })
                return
            }

            await disponibiliteService.deleteDisponibilite(idRaw)
            res.status(200).json({ message: 'Disponibilité supprimée avec succès' })
        } catch (err: any) {
            console.error('Error deleteDisponibilite:', err)
            res.status(err.statusCode ?? 500).json({ error: err.message })
        }
    },
}
