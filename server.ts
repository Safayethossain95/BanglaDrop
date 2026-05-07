import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Product = {
  id: string;
  name: string;
  supplierPrice: number;
  suggestedRetailPrice: number;
  image: string;
  description: string;
  category: string;
};

// Dummy database for the dropshipping app
const products: Product[] = [
  {
    id: "p1",
    name: "Wireless Earbuds Pro",
    supplierPrice: 800,
    suggestedRetailPrice: 1500,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
    description: "High-quality wireless earbuds with noise cancellation.",
    category: "Electronics"
  },
  {
    id: "p2",
    name: "Orthopedic Memory Foam Pillow",
    supplierPrice: 450,
    suggestedRetailPrice: 1200,
    image: "https://images.unsplash.com/photo-1583088580009-88bfc5d677d2?auto=format&fit=crop&q=80&w=600",
    description: "Ergonomic pillow for better sleep and neck support.",
    category: "Home & Lifestyle"
  },
  {
    id: "p3",
    name: "Smart Fitness Watch",
    supplierPrice: 1200,
    suggestedRetailPrice: 2500,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600",
    description: "Tracks heart rate, steps, and sleep patterns.",
    category: "Electronics"
  },
  {
    id: "p4",
    name: "Anti-Theft Backpack",
    supplierPrice: 600,
    suggestedRetailPrice: 1400,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    description: "Water-resistant backpack with hidden zippers and USB charging port.",
    category: "Fashion & Accessories"
  }
];

const orders: any[] = [];
const profits = {
  total: 0,
  pending: 0,
  available: 0
};
const supplierStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Returned", "Paid"] as const;

function normalizeProductPayload(body: Record<string, unknown>) {
  return {
    name: String(body.name ?? "").trim(),
    category: String(body.category ?? "").trim(),
    description: String(body.description ?? "").trim(),
    image: String(body.image ?? "").trim(),
    supplierPrice: Number(body.supplierPrice),
    suggestedRetailPrice: Number(body.suggestedRetailPrice),
  };
}

function validateProductPayload(product: ReturnType<typeof normalizeProductPayload>) {
  if (!product.name || !product.category || !product.description || !product.image) {
    return "All product fields are required.";
  }

  if (!Number.isFinite(product.supplierPrice) || product.supplierPrice < 0) {
    return "Supplier price must be a valid non-negative number.";
  }

  if (!Number.isFinite(product.suggestedRetailPrice) || product.suggestedRetailPrice < product.supplierPrice) {
    return "Suggested retail price must be at least the supplier price.";
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const appBaseUrl = process.env.APP_BASE_URL ?? `http://localhost:${PORT}`;
  const uddoktaPayBaseUrl = process.env.UDDOKTAPAY_BASE_URL ?? "https://sandbox.uddoktapay.com";
  const uddoktaPayApiKey =
    process.env.UDDOKTAPAY_API_KEY ?? "982d381360a69d419689740d9f2e26ce36fb7a50";

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  app.post("/api/products", (req, res) => {
    const payload = normalizeProductPayload(req.body ?? {});
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newProduct: Product = {
      id: "p" + Math.random().toString(36).substring(2, 8),
      ...payload,
    };

    products.unshift(newProduct);
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  });

  app.put("/api/products/:id", (req, res) => {
    const product = products.find((item) => item.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const payload = normalizeProductPayload(req.body ?? {});
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    Object.assign(product, payload);
    res.json({ message: "Product updated successfully", product });
  });

  app.delete("/api/products/:id", (req, res) => {
    const productIndex = products.findIndex((item) => item.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" });

    products.splice(productIndex, 1);
    res.json({ message: "Product deleted successfully" });
  });

  app.post("/api/orders", (req, res) => {
    const { productId, productSnapshot, customerName, customerPhone, address, sellPrice } = req.body;
    
    const product = products.find(p => p.id === productId) ?? (
      productSnapshot &&
      typeof productSnapshot.name === "string" &&
      typeof productSnapshot.image === "string" &&
      typeof productSnapshot.description === "string" &&
      typeof productSnapshot.category === "string" &&
      Number.isFinite(Number(productSnapshot.supplierPrice)) &&
      Number.isFinite(Number(productSnapshot.suggestedRetailPrice))
        ? {
            id: String(productId ?? ""),
            name: productSnapshot.name,
            image: productSnapshot.image,
            description: productSnapshot.description,
            category: productSnapshot.category,
            supplierPrice: Number(productSnapshot.supplierPrice),
            suggestedRetailPrice: Number(productSnapshot.suggestedRetailPrice),
          }
        : null
    );
    if (!product) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    if (sellPrice < product.supplierPrice) {
      return res.status(400).json({ error: "Sell price cannot be lower than supplier price." });
    }

    const profit = sellPrice - product.supplierPrice;

    const newOrder = {
      id: "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      productName: product.name,
      supplierPrice: product.supplierPrice,
      sellPrice,
      profit,
      customerName,
      customerPhone,
      address,
      status: "Pending",
      date: new Date().toISOString()
    };

    orders.push(newOrder);
    profits.pending += profit; // Add to pending profit

    res.status(201).json({ message: "Order placed successfully (Cash on Delivery)", order: newOrder });
  });

  app.get("/api/dashboard", (req, res) => {
    res.json({
      orders: orders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      profits
    });
  });

  app.post("/api/wallet/payout-checkout", async (req, res) => {
    const { fullName, email, amount, note, availableBalance, currentPath } = req.body ?? {};
    const parsedAmount = Number(amount);
    const parsedAvailable = Number(availableBalance);

    if (!String(fullName ?? "").trim()) {
      return res.status(400).json({ error: "Dropshipper name is required." });
    }
    if (!String(email ?? "").trim()) {
      return res.status(400).json({ error: "Dropshipper email is required." });
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Enter a valid payout amount." });
    }
    if (!Number.isFinite(parsedAvailable) || parsedAmount > parsedAvailable) {
      return res.status(400).json({ error: "Payout amount cannot exceed the available balance." });
    }

    const normalizedPath =
      typeof currentPath === "string" && currentPath.startsWith("/") ? currentPath : "/admin/dashboard";
    const redirectUrl = new URL(normalizedPath, appBaseUrl);
    redirectUrl.searchParams.set("walletPayment", "success");
    const cancelUrl = new URL(normalizedPath, appBaseUrl);
    cancelUrl.searchParams.set("walletPayment", "cancelled");

    try {
      const response = await fetch(`${uddoktaPayBaseUrl}/api/checkout-v2`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "RT-UDDOKTAPAY-API-KEY": uddoktaPayApiKey,
        },
        body: JSON.stringify({
          full_name: String(fullName).trim(),
          email: String(email).trim(),
          amount: String(parsedAmount),
          metadata: {
            purpose: "dropshipper-settlement",
            note: String(note ?? "").trim(),
            requested_from: normalizedPath,
          },
          redirect_url: redirectUrl.toString(),
          return_type: "GET",
          cancel_url: cancelUrl.toString(),
          webhook_url: new URL("/api/wallet/payout-webhook", appBaseUrl).toString(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.payment_url) {
        return res.status(500).json({ error: data?.message || "Failed to initialize UddoktaPay checkout." });
      }

      res.json({ paymentUrl: data.payment_url });
    } catch {
      res.status(500).json({ error: "Unable to reach the payment gateway right now." });
    }
  });

  app.post("/api/wallet/payout-webhook", (req, res) => {
    res.json({ ok: true });
  });

  // Action to update order status (e.g. from Admin dashboard)
  app.put("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!supplierStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }
    
    // Paid orders become available profit; moving away from paid reverses that settlement.
    if (status === "Paid" && order.status !== "Paid") {
      profits.pending -= order.profit;
      profits.total += order.profit;
      profits.available += order.profit;
    } else if (order.status === "Paid" && status !== "Paid") {
      profits.pending += order.profit;
      profits.total -= order.profit;
      profits.available -= order.profit;
    }
    
    order.status = status;
    res.json({ message: "Order status updated", order });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
