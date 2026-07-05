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
      console.log(`Fetching UID: ${uid} from URL: ${url}`);
      
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({ error: "এপিআই সার্ভারে সমস্যা হচ্ছে। পরে চেষ্টা করুন।" });
      }

      const contentType = response.headers.get("content-type");
      let nickname = "";

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        // Matching the screenshot: { "status": true, "data": { "username": "..." } }
        nickname = data.data?.username || data.data?.message || data.name || data.nickname || data.result;
      } else {
        // Fallback for plain text responses
        const text = await response.text();
        try {
          // Try to parse if it's JSON in text form
          const data = JSON.parse(text);
          nickname = data.name || data.nickname || data.nickname_freefire || data.result;
        } catch {
          nickname = text;
        }
      }
      
      console.log(`Success! Nickname for ${uid}: ${nickname}`);

      if (nickname && nickname.trim() && !nickname.includes("Invalid") && !nickname.includes("not found")) {
        return res.json({ nickname: nickname.trim() });
      }

      res.status(404).json({ error: "ইউআইডি (UID) ভুল অথবা প্লেয়ার পাওয়া যায়নি।" });
    } catch (error: any) {
      console.error("Error checking UID:", error);
      if (error.name === 'TimeoutError') {
        return res.status(504).json({ error: "এপিআই রেসপন্স দিতে দেরি করছে। আবার চেষ্টা করুন।" });
      }
      res.status(500).json({ error: "সার্ভারের সাথে যোগাযোগ করতে সমস্যা হচ্ছে।" });
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
