import express from 'express';
import {
  getAcademies,
  getAcademyById,
  createAcademy,
  updateAcademy,
  deleteAcademy
} from '../controllers/academy.controller.js';

const router = express.Router();

router.get('/', getAcademies);
router.get('/:id', getAcademyById);
router.post('/', createAcademy);
router.put('/:id', updateAcademy);
router.delete('/:id', deleteAcademy);

export default router;

