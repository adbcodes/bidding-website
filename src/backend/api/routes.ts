import { Router, RequestHandler } from "express";
import { bidControllers } from "./controllers";


const router = Router();

router.post('/bid', bidControllers.submitBid as RequestHandler);
router.get('/bids', bidControllers.getBids as RequestHandler);
router.get('/highest-bid/:itemName', bidControllers.getHighestBid as RequestHandler);

export default router;