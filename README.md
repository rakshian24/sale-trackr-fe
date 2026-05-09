# Sale Trackr — Frontend

React + Vite + TypeScript + MUI + Apollo Client + GraphQL.

For installing dependencies, env vars, and running against the backend, see the [project root README](../README.md).

---

## Stock, batches, and sales (FIFO)

Purchases are stored as **batches** per product (each row on **Purchases** is one batch). The backend consumes stock using **FIFO**: **oldest purchase first** (by purchase date/time), then the next batch.

### What you see in the UI

| Screen | What it shows |
|--------|----------------|
| **Add Sale** | You still choose **product**, **quantity to sell**, and **selling price**—same flow as before. **Stock on hand** is the total quantity left across all batches (same unit as the product). The hint explains that sales use FIFO (you do not pick a batch manually). |
| **Purchases** | Each row shows **purchased quantity** and **remaining** for that batch after sales. |

Validation prevents selling more than total stock (including quantities already added to the **current bill** before checkout).

### Example: onions in two batches

1. **Yesterday:** buy **5 kg** onions at cost ₹10/kg, selling ₹20/kg → one purchase batch with **5 kg remaining**.
2. **Today:** buy **10 kg** at cost ₹50/kg, selling ₹100/kg → second batch with **10 kg remaining**.

**Total stock on hand for onions:** 5 + 10 = **15 kg**.

When you sell **3 kg** on **Add Sale**:

- FIFO takes stock from the **oldest** batch first (**yesterday’s 5 kg**).
- **After the sale:** yesterday’s batch has **2 kg** remaining; today’s batch still has **10 kg**.  
  Total left: **12 kg**.

If you then sell **4 kg**:

- **2 kg** comes from yesterday’s batch (it is emptied).
- **2 kg** comes from today’s batch.
- **Remaining:** yesterday **0 kg**, today **8 kg**. Total **8 kg**.

Cost on each sale line is computed from the batches used (weighted average for that line); the important UX point is **you keep selecting the product only**—the app allocates batches automatically.

### Units

Only purchase batches whose **unit matches the product’s unit** count toward stock for that product. Use consistent units when recording purchases.

---

## Default Vite template notes

This project started from the Vite React + TS template. For React Compiler, ESLint expansion, and plugin details, see the [Vite React plugin docs](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md).
