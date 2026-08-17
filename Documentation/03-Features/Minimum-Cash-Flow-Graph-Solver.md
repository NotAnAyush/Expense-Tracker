---
title: Minimum Cash Flow Graph Solver & UPI Settlement
tags:
  - features
  - group-splits
  - algorithms
  - graph-theory
  - upi
version: 3.0.0
last_updated: 2026-08-17
---

# 🔗 Minimum Cash Flow Graph Solver & UPI Settlement

Located at: `server/src/services/group/debtSimplificationEngine.js`

---

## 1. Problem Statement & Graph Reduction

In shared group expenses (trips, rent, dining), if members pay for different bills independently, the naive transaction count grows quadratically:
$$\text{Max Transactions} = \frac{N(N-1)}{2} = O(N^2)$$

### Greedy Graph Reduction Algorithm:
1. Calculate Net Balance for each member $i$:
   $$\text{Net}_i = \sum \text{Paid By } i - \sum \text{Owed By } i$$
2. Identify maximum debtor (most negative net balance $D$) and maximum creditor (most positive net balance $C$).
3. Form a single transaction:
   $$\text{Amount} = \min(|D_{\text{net}}|, C_{\text{net}})$$
   $$\text{Transfer: } D \longrightarrow C \quad (\text{Amount})$$
4. Update balances $D_{\text{net}} \leftarrow D_{\text{net}} + \text{Amount}$, $C_{\text{net}} \leftarrow C_{\text{net}} - \text{Amount}$.
5. Repeat until all balances reach 0.
6. **Result**: Total transactions $\le N - 1$.

---

## 2. Dynamic UPI Intent QR Generation

Every resolved transfer ($A \to B \text{ for INR } X$) dynamically generates a standard NPCI UPI Intent URI:
```
upi://pay?pa=<payeeVpa>&pn=<payeeName>&am=<amount>&cu=INR&tn=Settlement-Group-Expense
```
This is encoded into an SVG/Canvas QR code in the frontend for one-tap mobile payment via Google Pay, PhonePe, or Paytm.
