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
      const apiKey = process.env.TOPX_API_KEY || "API-6PWWY2SU";
      const url = `https://topx.thtopup.shop/api.php?uid=${encodeURIComponent(uid)}&key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(15000) // Increase timeout to 15 seconds
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "এপিআই সার্ভার থেকে রেসপন্স পাওয়া যাচ্ছে না।" });
      }

      const data = await response.json();
      
      // Matching the API structure: { "status": true, "data": { "username": "..." } }
      if (data && data.status === true && data.data && data.data.username) {
        return res.json({ nickname: data.data.username });
      } else if (data && data.status === false) {
        return res.status(404).json({ error: data.message || "প্লেয়ার পাওয়া যায়নি বা ইউআইডি ভুল।" });
      }

      res.status(404).json({ error: "সঠিক তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।" });
    } catch (error: any) {
      console.error("Fetch Error:", error);
      if (error.name === 'TimeoutError') {
        return res.status(504).json({ error: "সার্ভার রেসপন্স দিতে দেরি করছে। আবার চেষ্টা করুন।" });
      }
      res.status(500).json({ error: "সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। ইন্টারনেট কানেকশন চেক করুন।" });
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
