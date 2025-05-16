import { Router, RequestHandler } from 'express';
import { getBalance } from '../controllers/seamless.controller';
import { placeBet } from '../controllers/PlaceBetController';
//import placeBet from '../controllers/PlaceBetController'; // ❌ Wrong
//import * as placeBet from '../controllers/PlaceBetController'; // ❌ Wrong

const router = Router();

router.post('/GetBalance', getBalance);
//router.post('/PlaceBet', placeBet);
router.post('/PlaceBet', placeBet as unknown as RequestHandler);

export default router;

