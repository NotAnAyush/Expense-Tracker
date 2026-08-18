<div align="center">

# 💎 Richy — Personal Financial Operating System (V2)

**The AI-first money management platform built for modern spenders, UPI power users, and online shoppers.**  
*Track every rupee, parse any receipt or e-commerce bill with itemized precision, and uncover the motive behind your spending.*

[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-00FF87?style=flat-square&logo=node.js&logoColor=050810)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-00F0FF?style=flat-square&logo=react&logoColor=050810)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-10B981?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tests](https://img.shields.io/badge/Tests-186%2F186%20Passing%20(100%25)-00FF87?style=flat-square&logo=jest&logoColor=050810)](https://jestjs.io)
[![Cyberpunk Theme](https://img.shields.io/badge/Design-Cyberpunk%20Glassmorphism-8B5CF6?style=flat-square)](#design-system)

</div>

---

## ⚡ Why Richy?

Most expense trackers are just glorified spreadsheets with a submit button. **Richy V2** is engineered from the ground up as a proactive financial assistant that does the heavy lifting for you:

- 🧾 **Drop any paper bill or GST invoice** — it doesn't just read the total; it extracts individual dish quantities, unit rates, merchant GSTIN, CGST, SGST, and packaging charges.
- 🛍️ **Sync orders from Amazon, Blinkit, Swiggy, Zepto, and Flipkart** in a single click with itemized matrices and psychological purchase motive tagging (`Need`, `Want`, `Impulse`, `Work`, `Investment`).
- 🔍 **Click on any transaction in your ledger** to open the **Deep Transaction Inspector** — view exact item breakdowns, GST deduction eligibility, and UTR payment forensics.
- 🛡️ **Zero Cloud Dependency Required** — works with pure deterministic local RAG heuristics or connects to Google Gemini Vision for neural tensor processing.
- 👁️ **Public Privacy Mask Mode** — hit the quick toggle or keyboard shortcut to blur all numbers when checking your dashboard in a cafe or commute.

---

## 🚀 Key Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RICHY 2.0 ARCHITECTURE                           │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│    Multimodal Vision OCR     │    E-Commerce Sync Engine    │  UPI Forensics│
│   • Indian GST Invoices      │   • Amazon, Flipkart, Myntra │  • Bharat QR  │
│   • Restaurant / Cafe Bills  │   • Blinkit, Zepto, BigBasket│  • UTR Match  │
│   • Item Qty & Unit Rates    │   • Swiggy & Zomato Delivery │  • GPay/Paytm │
└──────────────┬───────────────┴──────────────┬───────────────┴───────┬───────┘
               │                              │                       │
               ▼                              ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 TRANSACTION INTELLIGENCE & MOTIVE ANALYZER                  │
│       • Psychological Intent Tagging (Essential Need vs Impulse Want)       │
│       • Itemized Product Grid • GST Tax Claims (80C / 80D / Business)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. 📸 Multimodal Vision OCR 2.0
- **True Aspect Ratio Inspector**: Zoom In/Out (50%–300%), 90° Clockwise Rotation, Pan, and Fullscreen Ultra-HD Lightbox.
- **Itemized Extraction**: Captures product quantities, unit prices, subtotal, merchant GSTIN, CGST, SGST, IGST, delivery fees, and discounts.
- **4-Tab Review Workspace**: Overview, Item Quantities Grid (with editable rows and "Sync Totals" auto-calculator), GST & Tax Decomposition, and Smart Tags.

### 2. 🛍️ Multi-Platform E-Commerce & Quick-Commerce Sync
- **Supported Platforms**: Amazon India, Flipkart, Blinkit (10-Min Groceries), Zepto, Swiggy, Zomato, Myntra, and BigBasket.
- **1-Click Order Link & Text Ingestion**: Paste order confirmation emails, order share links, or invoice snippets.
- **Psychological Motive Derivation**: Automatically tags whether an expense is an essential grocery restock, late-night impulse snack, productivity work investment, or lifestyle purchase.
- **Email Forwarding Webhook**: Set up an auto-forward filter in Gmail to log e-commerce orders automatically.

### 3. 🔍 Deep Transaction & Motive Inspector
- Click on any transaction across the **Expenses Ledger** or **Dashboard** to reveal:
  - **Motive & Intent Bar**: Why this transaction occurred and how it fits into your monthly budget pace.
  - **Itemized Products Matrix**: All line items with quantities and unit rates.
  - **Tax & GST Breakdown**: Merchant GSTIN with one-click copy and Section 80C/80D/Business claim status.
  - **Payment Forensics**: UPI app icon (GPay, PhonePe, Paytm, CRED), UTR number, and payment mode.
  - **Quick Actions**: Edit in Full Form, Settle via UPI QR, Duplicate/Clone, Copy Slip, or Delete.

### 4. ⚡ UPI Payments & Settlement Hub
- Generates dynamic Bharat UPI QR codes for any expense or group split.
- Direct deep links for Google Pay, PhonePe, Paytm, and CRED.
- UTR and VPA tracking to prevent duplicate bank entries.

### 5. 📊 FIRE Simulator, Trip Vaults & Debt Payoff
- **FIRE Wealth Simulator**: Interactive Monte Carlo retirement pacing with safe withdrawal rate calculations.
- **Trip Vaults**: Dedicated budgets and multi-currency tracking for vacations and travel.
- **Group Splits**: Fair bill splitting with automated debt simplification.
- **Debt Payoff Ladder**: Avalanche vs. Snowball payoff timelines.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Vanilla Modern CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB, Mongoose, Helmet, Compression, Crypto |
| **AI / Vision** | Google Gemini Vision API (`unifiedAIClient.js`), Deterministic Local RAG (`localRagEngine.js`) |
| **Testing** | Jest, Supertest, MongoMemoryServer (26 Test Suites, 186/186 Passing) |

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas connection string

### 1. Clone the Repository
```bash
git clone https://github.com/NotAnAyush/Expense-Tracker.git
cd Expense-Tracker/V2
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Configure your `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
GEMINI_API_KEY=optional_gemini_api_key_for_vision_ocr
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

The client application will launch at `http://localhost:5173`.

---

## 🧪 Running Tests

The test suite includes full coverage for authentication, receipt OCR, e-commerce sync, UPI crypto security, and tax calculations:

```bash
# Run all server tests
cd server
npm test

# Run specific e-commerce sync tests
npm test -- tests/ecommerceSync.test.js

# Build client for production
cd ../client
npm run build
```

---

## 📂 Project Structure

```
Expense-Tracker/V2/
├── client/
│   ├── src/
│   │   ├── api/             # API client & local date utilities
│   │   ├── components/
│   │   │   ├── Expenses/    # ReceiptScanModal, EcommerceSyncModal, TransactionDetailModal
│   │   │   ├── Dashboard/   # KPI Cards, Category Breakdown, Health Score
│   │   │   ├── Copilot/     # AI Chat Drawer & Prompt Studio
│   │   │   ├── UPI/         # UPI QR Code & Payment Flow
│   │   │   └── Shell/       # Sidebar, Header, Privacy Mask
│   │   └── pages/           # Dashboard, Expenses, Analytics, FIRE, Vaults
├── server/
│   ├── src/
│   │   ├── controllers/     # Expense, E-Commerce, UPI, AI, Auth controllers
│   │   ├── models/          # Expense, Income, Budget, Vault, User schemas
│   │   ├── routes/          # REST endpoints & webhook routes
│   │   └── services/
│   │       ├── ai/          # Vision OCR tensor engine & local RAG
│   │       └── import/      # E-commerce parser & bank statement import
│   └── tests/               # 26 Jest test suites (186 tests)
└── Documentation/           # System architecture & feature blueprints
```

---

## 🔒 Privacy & Security

- **Client-Side Privacy Mask**: Instantly masks account balances and numbers in public settings.
- **End-to-End Vault Encryption**: Financial notes and sensitive credentials use AES-256-GCM encryption.
- **Zero Mandatory Third-Party AI**: All core operations function 100% offline with zero cloud API keys needed.
- **Rate-Limiting & Sanitization**: Protects against brute-force and NoSQL injection attacks.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for financial freedom and precision tracking.</sub>
</div>
