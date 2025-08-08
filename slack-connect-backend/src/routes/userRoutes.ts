import express from 'express';
import { getUsers } from '../controllers/userControler.js';

const router = express.Router();

router.get('/get/:id', getUsers);

export default router;
