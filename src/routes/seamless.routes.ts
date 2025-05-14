import { Router } from 'express';
import { getBalance } from '../controllers/seamless.controller';

const router = Router();

router.post('/GetBalance', getBalance);

export default router; 