INSERT INTO bids (item_name, bid_amount, bidder_name) 
VALUES ($1, $2, $3)
RETURNING id, item_name, bid_amount, bidder_name, created_at;