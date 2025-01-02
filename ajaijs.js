// JavaScript for Auction Website

// Example: Adding interactivity to the auction section

// Fake data for dynamic bidding (for demonstration purposes)
const auctionData = [
    { id: 1, title: "Horizen men's Watch", currentBid: 24000 },
    { id: 2, title: "Jasmine ring", currentBid: 15000 },
    { id: 3, title: "Artwork by John Doe", currentBid: 4999 }
];

// Function to update the current bid for an item
function updateBid(itemId, newBid) {
    const auctionItem = auctionData.find(item => item.id === itemId);
    if (auctionItem) {
        auctionItem.currentBid = newBid;
        renderAuctions();
    } else {
        console.error(`Item with ID ${itemId} not found.`);
    }
}

// Function to render the auction items dynamically
function renderAuctions() {
    const auctionList = document.querySelector('.auction-list');
    auctionList.innerHTML = ''; // Clear current items

    auctionData.forEach(item => {
        const auctionItemDiv = document.createElement('div');
        auctionItemDiv.classList.add('auction-item');

        auctionItemDiv.innerHTML = `
            <img src="item${item.id}.jpg" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>Current Bid: ₹${item.currentBid}</p>
            <button class="btn" onclick="promptNewBid(${item.id})">Bid Now</button>
        `;

        auctionList.appendChild(auctionItemDiv);
    });
}

// Function to prompt the user for a new bid
function promptNewBid(itemId) {
    const newBid = parseFloat(prompt("Enter your bid:"));
    if (!isNaN(newBid)) {
        const auctionItem = auctionData.find(item => item.id === itemId);
        if (newBid > auctionItem.currentBid) {
            updateBid(itemId, newBid);
            alert("Your bid was successful!");
        } else {
            alert("Your bid must be higher than the current bid.");
        }
    } else if(newBid == null){
        alert("Invalid input. Please enter a numeric value.");
    }
}

// Initialize the auctions on page load
document.addEventListener('DOMContentLoaded', () => {
    renderAuctions();
});
