# Testing the E-commerce Auction Features

## Quick Start
1. Navigate to the react-frontend directory:
   ```bash
   cd react-frontend
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:3000
   ```

## What to Test

### 1. Basic Functionality
- ✅ **Page Loads**: Auction page should display with 10 sample products
- ✅ **Images Display**: All product images should load correctly
- ✅ **Cart Summary**: Header should show "0 items" initially
- ✅ **Filter Buttons**: "All", "Active", "Ended" filters should work

### 2. Cart Features
- **Add to Cart**: Click "🛒 Add to Cart" on any product
  - Button should change to "🛒 Remove"
  - Cart count in header should increase
  - Cart total should update
- **Remove from Cart**: Click "🛒 Remove" on a product in cart
  - Button should change back to "🛒 Add to Cart"
  - Cart count should decrease
  - Cart total should update
- **Checkout Button**: Should appear when cart has items
  - Clicking shows success message with total

### 3. Watchlist Features
- **Add to Watchlist**: Click "⭐ Watch" on any product
  - Button should change to "⭐ Saved"
- **Remove from Watchlist**: Click "⭐ Saved"
  - Button should change back to "⭐ Watch"

### 4. Buy Now Feature
- **Buy Now**: Click "💳 Buy Now" on any product
  - Should show success toast with product details

### 5. Persistence
- **Page Refresh**: Add items to cart/watchlist, refresh page
  - Cart/watchlist should persist
  - Items should remain in cart/watchlist

### 6. Responsive Design
- **Mobile View**: Resize browser to mobile size
  - Layout should adjust properly
  - Buttons should be accessible

## Expected Results

### Product Information
Each product card should display:
- ✅ Product image with status badge
- ✅ Product title (truncated if too long)
- ✅ Product description (truncated to 2 lines)
- ✅ Current bid (highlighted in green)
- ✅ Starting bid
- ✅ Time remaining (countdown)
- ✅ Active bidders count (if > 0)
- ✅ Total bids count (if > 0)

### Cart Summary in Header
Should show:
- ✅ Cart icon (🛒)
- ✅ Item count (e.g., "3 items")
- ✅ Total value (e.g., "₹ 45,000")
- ✅ Checkout button (when cart has items)

### Filtering
- **All**: Shows all 10 products
- **Active**: Shows products with future end times
- **Ended**: Shows products with past end times

## Troubleshooting

### If images don't load:
1. Check that images are in `react-frontend/public/` folder
2. Verify image filenames match those in `sampleProducts.js`
3. Check browser console for 404 errors

### If cart doesn't persist:
1. Check browser localStorage is enabled
2. Verify no JavaScript errors in console

### If React app doesn't start:
1. Make sure you're in `react-frontend` directory
2. Check `package.json` has all dependencies
3. Try `npm install` if dependencies missing

## Sample Test Data
The system includes 10 sample products with:
- Prices ranging from ₹3,000 to ₹4,500,000
- End times from 1 to 6 days in the future
- Various categories (Sports, Automotive, Fashion, etc.)
- Different conditions (New, Used, Like New)

## Success Criteria
- All 10 products display correctly
- Cart functionality works (add/remove/checkout)
- Watchlist functionality works
- Buy Now shows appropriate messages
- UI is responsive on different screen sizes
- Data persists across page reloads