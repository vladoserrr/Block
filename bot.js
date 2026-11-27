const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = "https://block-production-056a278e.up.railway.app";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is required. Add it as a Railway environment variable.");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function telegram(method, payload = {}) {
  const response = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || `Telegram API error: ${method}`);
  return data.result;
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message?.text) return;

  if (/^\/start(?:@\w+)?(?:\s|$)/i.test(message.text)) {
    await telegram("sendMessage", {
      chat_id: message.chat.id,
      text: "Привет, что-бы начать пользоваться маркетом, нажми на кнопку снизу :",
      reply_markup: {
        inline_keyboard: [[
          {
            text: "Открыть маркет",
            web_app: { url: APP_URL },
          },
        ]],
      },
    });
  }
}

async function poll() {
  let offset = 0;
  console.log("BLOCK Telegram bot is polling for updates...");
  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: 50,
        allowed_updates: ["message"],
      });
      for (const update of updates) {
        offset = update.update_id + 1;
        try {
          await handleUpdate(update);
        } catch (error) {
          console.error("Failed to handle update:", error.message);
        }
      }
    } catch (error) {
      console.error("Polling error:", error.message);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

poll();
