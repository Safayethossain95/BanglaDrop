import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dummy database for the dropshipping app
const products = [
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

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  app.post("/api/orders", (req, res) => {
    const { productId, customerName, customerPhone, address, sellPrice } = req.body;
    
    const product = products.find(p => p.id === productId);
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
      status: "Placed", // Placed -> Delivered -> Paid
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

  // Action to update order status (e.g. from Admin dashboard)
  app.put("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    // If transitioning to Paid, move profit from pending to available
    if (status === "Paid" && order.status !== "Paid") {
      profits.pending -= order.profit;
      profits.total += order.profit;
      profits.available += order.profit;
    } else if (order.status === "Paid" && status !== "Paid") {
       // If reverting from Paid
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
