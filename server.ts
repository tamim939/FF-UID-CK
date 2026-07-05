import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to check FF UID
  app.get("/api/check-uid/:uid", async (req, res) => {
    const { uid } = req.params;

    if (!uid || isNaN(Number(uid))) {
      return res.status(400).json({ error: "Invalid UID" });
    }

    try {
      const url = `https://zevnixapi.vercel.app/nickname?uid=${encodeURIComponent(uid)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch from API");
      }

      // Checking if response is JSON or text
      const contentType = response.headers.get("content-type");
      let nickname = "";

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        nickname = data.nickname || data.name || data.nickname_freefire || data.result;
      } else {
        nickname = await response.text();
      }
      
      if (nickname && nickname.trim()) {
        return res.json({ nickname: nickname.trim() });
      }

      res.status(404).json({ error: "প্লেয়ারের নাম পাওয়া যায়নি।" });
    } catch (error) {
      console.error("Error checking UID:", error);
      res.status(500).json({ error: "Server error while checking UID" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
