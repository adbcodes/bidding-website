// Base interfaces
export interface Command {
    type: string;
    payload: any;
  }
  
  export interface Event {
    type: string;
    payload: any;
    timestamp: number;
  }
  
  // Bid related types
  export interface Bid {
    item_name: string;
    bid_amount: number;
    bidder_name: string;
  }
  
  // Commands
  export interface PlaceBidCommand extends Command {
    type: 'PLACE_BID';
    payload: Bid;
  }
  
  // Events
  export interface BidPlacedEvent extends Event {
    type: 'BID_PLACED';
    payload: Bid;
  }
  
  export interface BidRejectedEvent extends Event {
    type: 'BID_REJECTED';
    payload: {
      bid: Bid;
      reason: string;
    };
  }
  