// JavaScript for Auction Website

// Example: Adding interactivity to the auction section

// Fake data for dynamic bidding (for demonstration purposes)
const auctionData = [
    { id: 1, title: "Horizen men's Watch", currentBid: 24000, timeLeft: 120 },
    { id: 2, title: "Jasmine ring", currentBid: 15000, timeLeft: 90 },
    { id: 3, title: "Artwork by John Doe", currentBid: 4999, timeLeft: 60 }
];

// Helper to format seconds as mm:ss
function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

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

// Timer logic
setInterval(() => {
    let changed = false;
    auctionData.forEach(item => {
        if (item.timeLeft > 0) {
            item.timeLeft--;
            changed = true;
        }
    });
    if (changed) renderAuctions();
}, 1000);

// Function to render the auction items dynamically
function renderAuctions() {
    const auctionList = document.querySelector('.auction-list');
    auctionList.innerHTML = '';

    auctionData.forEach(item => {
        const auctionItemDiv = document.createElement('div');
        auctionItemDiv.classList.add('auction-item');

        auctionItemDiv.innerHTML = `
            <img src="item${item.id}.jpg" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>Current Bid: ₹${item.currentBid}</p>
            <p class="timer" style="font-weight:bold; color:#ff6600;">Time Left: <span id="timer-${item.id}">${formatTime(item.timeLeft)}</span></p>
            <button class="btn" onclick="openBidModal(${item.id})" id="bidBtn-${item.id}" ${item.timeLeft === 0 ? 'disabled' : ''}>Bid Now</button>
        `;

        auctionList.appendChild(auctionItemDiv);
    });
}

// --- Modal Bidding Logic ---
let currentBidItemId = null;

function openBidModal(itemId) {
    const auctionItem = auctionData.find(item => item.id === itemId);
    if (!auctionItem) return;
    currentBidItemId = itemId;
    document.getElementById('modalImg').src = `item${itemId}.jpg`;
    document.getElementById('modalItemTitle').textContent = auctionItem.title;
    document.getElementById('modalCurrentBid').textContent = `Current Bid: ₹${auctionItem.currentBid}`;
    // Show timer in modal
    let timerElem = document.getElementById('modalTimer');
    if (!timerElem) {
        timerElem = document.createElement('div');
        timerElem.id = 'modalTimer';
        timerElem.style.fontWeight = 'bold';
        timerElem.style.color = '#ff6600';
        timerElem.style.margin = '0.5rem 0 1rem 0';
        document.querySelector('.modal-content').insertBefore(timerElem, document.getElementById('modalBidInput'));
    }
    timerElem.textContent = `Time Left: ${formatTime(auctionItem.timeLeft)}`;
    // Disable bid if time is up
    document.getElementById('modalBidBtn').disabled = auctionItem.timeLeft === 0;
    document.getElementById('modalBidBtn').textContent = auctionItem.timeLeft === 0 ? 'Auction Ended' : 'BID';
    document.getElementById('modalBidInput').value = '';
    document.getElementById('bidModal').style.display = 'block';
    clearModalMessage();
}

function closeBidModal() {
    document.getElementById('bidModal').style.display = 'none';
    currentBidItemId = null;
}

function showModalMessage(msg, isError = false) {
    let msgElem = document.getElementById('modalMsg');
    if (!msgElem) {
        msgElem = document.createElement('div');
        msgElem.id = 'modalMsg';
        msgElem.style.margin = '1rem 0';
        msgElem.style.fontWeight = 'bold';
        document.querySelector('.modal-content').appendChild(msgElem);
    }
    msgElem.textContent = msg;
    msgElem.style.color = isError ? '#e53935' : '#388e3c';
}
function clearModalMessage() {
    const msgElem = document.getElementById('modalMsg');
    if (msgElem) msgElem.textContent = '';
}

document.getElementById('closeModal').onclick = closeBidModal;
document.getElementById('modalFoldBtn').onclick = closeBidModal;
document.getElementById('modalBidBtn').onclick = function() {
    const input = document.getElementById('modalBidInput');
    const newBid = parseFloat(input.value);
    const auctionItem = auctionData.find(item => item.id === currentBidItemId);
    if (auctionItem.timeLeft === 0) {
        showModalMessage('Auction has ended.', true);
        return;
    }
    if (isNaN(newBid)) {
        showModalMessage('Please enter a numeric value.', true);
        return;
    }
    if (newBid > auctionItem.currentBid) {
        updateBid(currentBidItemId, newBid);
        showModalMessage('Your bid was successful!', false);
        setTimeout(closeBidModal, 1200);
    } else {
        showModalMessage('Your bid must be higher than the current bid.', true);
    }
};

// Initialize the auctions on page load
document.addEventListener('DOMContentLoaded', () => {
    renderAuctions();
});
