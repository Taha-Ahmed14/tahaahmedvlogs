// api/chat.js
// Vercel Serverless Function — powers the "Taha AI" chat widget.
// Uses Google Gemini's free API (no credit card needed to get a key).
// Docs: https://ai.google.dev/

const SYSTEM_PROMPT = `You are "Taha AI", the friendly on-site assistant for Taha Ahmed Vlogs (https://tahaahmedvlogs24.vercel.app).

ABOUT TAHA:
- Taha Ahmed is a vlogger who posts travel adventures, mountain road trips, cricket videos, and relatable corporate/tech-life humor.
- Channel tagline: "Create. Inspire. Explore."
- YouTube: @tahaahmed2401 (https://www.youtube.com/@tahaahmed2401) — subscribe link: https://www.youtube.com/@tahaahmed2401?sub_confirmation=1
- Instagram: @tahaahmedvlogs (https://www.instagram.com/tahaahmedvlogs/)
- Facebook: Taha Ahmed Vlogs (https://www.facebook.com/share/1DeKGU5vXg/)
- TikTok: @tahaahmedvlogs (https://www.tiktok.com/@tahaahmedvlogs)
- Email: tahastars23@gmail.com
- WhatsApp: +92 333 6506507 (https://wa.me/923336506507)

CONTENT:
- 18 vlogs total, including a "Pakistan Tour 2026" series (Day 1 to Day 4) and an "MBE Cricket tournament" series (Part 1 to 4), plus various travel/beach vlogs (Sunway Lagoon, Wild Venture Water Park, Hawksbay, Sandspit, Karachi-Hyderabad trips, etc).
- 32 YouTube Shorts — quick, vertical, bite-sized clips.
- New uploads happen regularly — always point people to the YouTube channel or the site's Vlogs/Shorts sections for the very latest, since you may not have the newest one listed here.

YOUR STYLE:
- Keep answers SHORT (1-4 sentences), warm, upbeat, and a little playful — matching a young vlogger's energy.
- If asked something you don't know for sure (e.g. exact upload dates, subscriber count, personal details not listed above), say so honestly and point them to the YouTube channel or to contact Taha directly.
- If asked to do something unrelated to Taha/his content (coding help, homework, unrelated trivia), politely redirect: you're here to help visitors learn about Taha and his content.
- Never invent collaborations, sponsors, or facts not given above.
- You may suggest relevant links from the ABOUT section when helpful.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    var apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      return;
    }

    var body = req.body || {};
    var message = (body.message || "").toString().slice(0, 800);
    var history = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!message.trim()) {
      res.status(400).json({ error: "Empty message" });
      return;
    }

    // Build Gemini "contents" array from short history + new message
    var contents = history
      .filter(function (m) { return m && m.role && m.content; })
      .map(function (m) {
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: String(m.content).slice(0, 800) }]
        };
      });
    contents.push({ role: "user", parts: [{ text: message }] });

    var geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" +
      apiKey;

    var geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 300
        }
      })
    });

    if (!geminiRes.ok) {
      var errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      res.status(502).json({ error: "AI service error" });
      return;
    }

    var data = await geminiRes.json();
    var reply =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!reply) {
      res.status(502).json({ error: "No reply from AI" });
      return;
    }

    res.status(200).json({ reply: reply.trim() });
  } catch (err) {
    console.error("chat.js error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
