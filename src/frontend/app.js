class BiddingApp {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.wsUrl = 'ws://localhost:3000';
        this.bidForm = document.getElementById('bidForm');
        this.socket = null;
        
        if (!this.bidForm) {
            console.error('Required elements not found');
            return;
        }
        
        this.initialize();
    }

    async updateHighestBids() {
        const items = [
            {
                displayName: 'Antique Vase',
                elementId: 'antiqueVase-highest'
            },
            {
                displayName: 'Ruby Necklace',
                elementId: 'rubyNecklace-highest'
            },
            {
                displayName: 'Signed Bat - Virat Kohli',
                elementId: 'signedBat-highest'
            }
        ];
    
        for (const item of items) {
            try {
                const encodedItemName = encodeURIComponent(item.displayName);
                const url = `${this.apiUrl}/highest-bid/${encodedItemName}`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                const element = document.getElementById(item.elementId);
                if (element) {
                    if (data && data.highestBid !== null && data.highestBid !== undefined) {
                        element.textContent = `Current Highest Bid: ₹${data.highestBid.toLocaleString('en-IN')}`;
                    } else {
                        element.textContent = 'No bids yet';
                    }
                }
            } catch (error) {
                console.error(`Error fetching highest bid for ${item.displayName}:`, error);
                const element = document.getElementById(item.elementId);
                if (element) {
                    element.textContent = 'Error loading highest bid';
                }
            }
        }
    }
    

    initialize() {
        this.bidForm.addEventListener('submit', this.handleSubmit.bind(this));
        this.loadBids();
        this.updateHighestBids();
        this.connectWebSocket();

        setInterval(() => this.updateHighestBids(), 3000);
    }

    connectWebSocket() {
        this.socket = new WebSocket(this.wsUrl);
        
        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };
        
        this.socket.onmessage = (event) => {
            const eventData = JSON.parse(event.data);
            console.log('WebSocket event received:', eventData);
            
            if (eventData.type === 'BID_PLACED') {
                // Refresh bids when a new bid is placed
                this.loadBids();
                this.updateHighestBids(); 
            } else if (eventData.type === 'BID_REJECTED') {
                alert(`Bid rejected: ${eventData.payload.reason}`);
            }
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
            // Try to reconnect after a delay
            setTimeout(() => this.connectWebSocket(), 3000);
        };
    }

    async handleSubmit(e) {
        e.preventDefault();

        const bid = {
            item_name: document.getElementById('itemName').value,
            bid_amount: parseFloat(document.getElementById('bidAmount').value),
            bidder_name: document.getElementById('bidderName').value
        };

        try {
            console.log('Submitting bid:', bid);
            const response = await fetch(`${this.apiUrl}/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bid)
            });

            if (response.ok) {
                console.log('Bid submitted successfully');
                this.bidForm.reset();
                // No need to reload bids here as WebSocket will notify us
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit bid');
            }
        } catch (error) {
            console.error('Error submitting bid:', error);
            alert('Failed to submit bid: ' + error.message);
        }
    }

    async loadBids() {
        try {
            console.log('Fetching bids...');
            const response = await fetch(`${this.apiUrl}/bids`);
            if (!response.ok) {
                throw new Error('Failed to fetch bids');
            }
            const bids = await response.json();
            console.log('Received bids:', bids);
            this.renderBids(bids);
        } catch (error) {
            console.error('Error loading bids:', error);
        }
    }

    renderBids(bids) {
        if (bids.length === 0) {
            this.bidsList.innerHTML = '<p>No bids yet</p>';
            return;
        }

        this.bidsList.innerHTML = bids.map(bid => `
            <div class="bid-item">
                <p><strong>Item:</strong> ${bid.item_name}</p>
                <p><strong>Amount:</strong> ₹${bid.bid_amount}</p>
                <p><strong>Bidder:</strong> ${bid.bidder_name}</p>
                <p><strong>Time:</strong> ${bid.created_at ? new Date(bid.created_at).toLocaleString() : 'N/A'}</p>
            </div>
        `).join('');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing BiddingApp');
    new BiddingApp();
});
