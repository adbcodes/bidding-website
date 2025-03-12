import { Request, Response } from "express";
import { Bid, Command, PlaceBidCommand } from "../models/types";
import { produceCommand } from "../messaging/producer";
import { dbOperations } from "../db/operations";

export const bidControllers = {
  async submitBid(req: Request, res: Response) {
    try {
      // Get current highest bid
      const highestBids = await dbOperations.getHighestBid(req.body.item_name);
      const currentHighestBid =
        highestBids.length > 0 ? highestBids[0].bid_amount : 0;

      // Validate bid amount
      if (req.body.bid_amount <= currentHighestBid) {
        return res.status(400).json({
          error: `Bid must be higher than current highest bid: ₹${currentHighestBid.toLocaleString("en-IN")}`,
        });
      }

      // Sanitize bidder name
      const sanitizedBid = {
        ...req.body,
        bidder_name:
          req.body.bidder_name.charAt(0).toUpperCase() +
          req.body.bidder_name.slice(1).toLowerCase(),
      };

      const command: PlaceBidCommand = {
        type: "PLACE_BID",
        payload: req.body,
      };

      await produceCommand(command);
      res.status(202).json({ message: "Bid submitted for processing" });
    } catch (error) {
      console.error("Error submitting bid:", error);
      res.status(500).json({ error: "Failed to submit bid" });
    }
  },

  async getBids(req: Request, res: Response) {
    try {
      const bids = await dbOperations.getBids();
      res.status(200).json(bids);
    } catch (error) {
      console.error("Error while fetching bids:", error);
      res.status(500).json({ error: "Failed to fetch bids" });
    }
  },

  async getHighestBid(req: Request, res: Response) {
    try {
      const itemName = req.params.itemName;

      if (!itemName) {
        return res.status(400).json({ error: "Item name is required" });
      }

      const highestBids = await dbOperations.getHighestBid(itemName);

      if (highestBids && highestBids.length > 0) {
        const highestBid = parseInt(highestBids[0].highest_bid);
        res.status(200).json({ highestBid });
      } else {
        res.status(200).json({ highestBid: null });
      }
    } catch (error) {
      console.error("Error in getHighestBid controller:", error);
      res.status(500).json({ error: "Failed to fetch highest bid" });
    }
  },
};
