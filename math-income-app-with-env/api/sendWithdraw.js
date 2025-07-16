
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });
  const { phone, method, amount, username, id } = req.body;
  const message = `📤 নতুন Withdraw Request:
👤 Username: ${username}
🆔 ID: ${id}
📞 Phone: ${phone}
💰 Amount: ৳${amount}
🔻 Fee: ৳0.05
💳 Method: ${method}
📅 Time: ${new Date().toLocaleString()}`;

  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.CHAT_ID,
      text: message,
    }),
  });

  if (response.ok) {
    res.status(200).json({ success: true });
  } else {
    res.status(500).json({ error: 'Telegram API failed' });
  }
}
