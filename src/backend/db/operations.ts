import { pool } from "../config/database";
import { Bid } from "../models/types";
import fs from "fs";
import path from "path";

const loadSqlFile = (filename: string) => {
  return fs.readFileSync(path.join(__dirname, "sql", filename), "utf8");
};

export const dbOperations = {
  async insertBid(bid: Bid): Promise<any> {
    const query = loadSqlFile("insertBid.sql");
    const result = await pool.query(query, [
      bid.item_name,
      bid.bid_amount,
      bid.bidder_name,
    ]);
    return result.rows[0];
  },

  async getBids(): Promise<any[]> {
    const query = loadSqlFile("getBids.sql");
    const result = await pool.query(query);
    return result.rows;
  },

  async getHighestBid(itemName?: string): Promise<any[]> {
    const query = loadSqlFile("getHighestBid.sql");
    const result = await pool.query(query, [itemName]);
    return result.rows;
  },
};
