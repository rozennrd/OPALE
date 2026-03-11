import express from 'express'
import authJwt from '../../middleware/authJwt'
import { exportDocumentationPdf } from '../controllers/documentationController'

const router = express.Router()

router.post('/documentation/export', authJwt.verifyToken, (req, res) => {
    void exportDocumentationPdf(req, res)
})

export default router
