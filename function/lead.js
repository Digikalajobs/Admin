exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, message: "Method not allowed" });
  }

  let data = {};
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { ok: false, message: "Invalid JSON" });
  }

  const phone = String(data.phone || "").trim();

  if (!/^09\d{9}$/.test(phone)) {
    return response(400, { ok: false, message: "Invalid phone" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return response(200, { ok: true, message: "Saved locally; Telegram env is not configured." });
  }

  const text = [
    "📥 درخواست دانلود جدید",
    "",
    `شماره موبایل: ${phone}`,
    `منبع: ${data.source || "landing"}`,
    `زمان: ${new Date().toLocaleString("fa-IR")}`
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (error) {
    return response(500, { ok: false, message: "Telegram send failed" });
  }

  return response(200, { ok: true });
};

function response(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(payload)
  };
}
