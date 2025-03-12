SELECT 
    item_name,
    MAX(bid_amount) as highest_bid,
    bidder_name
FROM bids
WHERE item_name = $1
GROUP BY item_name, bidder_name
ORDER BY MAX(bid_amount) DESC
LIMIT 1;
