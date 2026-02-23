import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const PORT = 3000;
  
  // In-memory store (for production, this would be a database)
  const store: Record<string, any[]> = {
    chat: [],
    tasks: [],
    notes: [],
    habits: [],
    blocks: [],
    calendar: [],
    journal: []
  };

  // WebSocket logic
  wss.on("connection", (ws) => {
    console.log("Client connected");
    
    // Send all initial data to new client
    ws.send(JSON.stringify({ type: 'init_all', data: store }));

    ws.on("message", (data) => {
      try {
        const payload = JSON.parse(data.toString());
        const { type, collection, data: item } = payload;

        if (type === 'sync' && collection && store[collection]) {
          // Update store
          if (Array.isArray(item)) {
            store[collection] = item;
          } else {
            // Handle single item update/create
            const index = store[collection].findIndex(i => i.id === item.id);
            if (index !== -1) {
              store[collection][index] = item;
            } else {
              store[collection].push(item);
            }
          }

          // Broadcast change to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'sync', collection, data: store[collection] }));
            }
          });
        }
      } catch (e) {
        console.error("Error processing message:", e);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
