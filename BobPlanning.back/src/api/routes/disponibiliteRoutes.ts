import { Router } from 'express'
import authJwt from '../../middleware/authJwt'
import { disponibiliteController } from '../controllers/disponibiliteController'

const router = Router()

router.get('/getDisponibilites', authJwt.verifyToken, disponibiliteController.getDisponibilites)
router.get('/getDisponibiliteById', authJwt.verifyToken, disponibiliteController.getDisponibiliteById)

router.post('/addDisponibilite', authJwt.verifyToken, disponibiliteController.addDisponibilite)
router.put('/updateDisponibilite', authJwt.verifyToken, disponibiliteController.updateDisponibilite)
router.delete('/deleteDisponibilite', authJwt.verifyToken, disponibiliteController.deleteDisponibilite)

export default router
