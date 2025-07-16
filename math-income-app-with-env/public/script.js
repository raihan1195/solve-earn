
let balance = 0;
let solved = 0;
let correctAnswer = 0;
let cooldownUntil = null;
let userAnswer = '';
let tg = window.Telegram?.WebApp;
tg?.expand();
let telegramUser = null;

if (tg?.initDataUnsafe && tg.initDataUnsafe.user) {
  telegramUser = tg.initDataUnsafe.user;
  const username = telegramUser.username || telegramUser.first_name || 'User';
  const id = telegramUser.id;
  document.getElementById("userInfo").innerText = `👤 ${username} | ID: ${id}`;
} else {
  document.getElementById("userInfo").innerText = "⚠️ Telegram User পাওয়া যায়নি";
}

function loadData() {
  balance = parseFloat(localStorage.getItem('mathAppBalance') || '0');
  solved = parseInt(localStorage.getItem('mathAppSolved') || '0');
  cooldownUntil = parseInt(localStorage.getItem('mathAppCooldown') || '0');
}
function saveData() {
  localStorage.setItem('mathAppBalance', balance.toFixed(2));
  localStorage.setItem('mathAppSolved', solved);
  if (cooldownUntil) {
    localStorage.setItem('mathAppCooldown', cooldownUntil);
  } else {
    localStorage.removeItem('mathAppCooldown');
  }
}
function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  correctAnswer = eval(`${a}${op}${b}`);
  document.getElementById("question").innerText = `প্রশ্ন: ${a} ${op} ${b}`;
  userAnswer = '';
}
function updateScreen() {
  document.getElementById("question").innerText = document.getElementById("question").innerText.split('=')[0] + ` = ${userAnswer}`;
}
function appendToAnswer(val) {
  if (cooldownUntil && Date.now() < cooldownUntil) return;
  userAnswer += val;
  updateScreen();
}
function clearAnswer() {
  if (cooldownUntil && Date.now() < cooldownUntil) return;
  userAnswer = '';
  updateScreen();
}
function backspace() {
  if (cooldownUntil && Date.now() < cooldownUntil) return;
  userAnswer = userAnswer.slice(0, -1);
  updateScreen();
}
function checkCooldown() {
  if (cooldownUntil && Date.now() < cooldownUntil) {
    const diff = Math.ceil((cooldownUntil - Date.now()) / 1000);
    document.getElementById("cooldown").innerText = `⏳ ${Math.floor(diff / 60)} মিনিট ${diff % 60} সেকেন্ড অপেক্ষা করুন`;
    document.getElementById("calculator").style.display = "none";
    return true;
  } else {
    document.getElementById("cooldown").innerText = "";
    document.getElementById("calculator").style.display = "block";
    return false;
  }
}
function checkAnswer() {
  if (checkCooldown()) return;
  if (userAnswer.trim() === '') {
    alert("উত্তর লিখে জমা দিন!");
    return;
  }
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "⏳ যাচাই হচ্ছে...";
  setTimeout(() => {
    if (parseInt(userAnswer) === correctAnswer) {
      balance += 0.05;
      solved += 1;
      alert("✔️ সঠিক উত্তর! ০.০৫ টাকা পেলেন।");
    } else {
      alert("❌ ভুল উত্তর!");
    }
    if (solved >= 100) {
      cooldownUntil = Date.now() + (20 * 60 * 1000);
      alert("❗️আপনি ১০০টা প্রশ্ন সলভ করেছেন। এখন ২০ মিনিট অপেক্ষা করুন!");
      solved = 0;
    }
    saveData();
    updateUI();
    generateQuestion();
    userAnswer = '';
    submitBtn.disabled = false;
    submitBtn.innerText = "জমা দাও";
  }, 3000);
}
function updateUI() {
  document.getElementById("balance").innerText = `৳${balance.toFixed(2)}`;
  document.getElementById("solved").innerText = solved;
  checkCooldown();
}
function toggleWithdraw() {
  const box = document.getElementById('withdrawBox');
  box.style.display = (box.style.display === 'block') ? 'none' : 'block';
}
function sendWithdraw() {
  const phone = document.getElementById("phone").value.trim();
  const method = document.getElementById("method").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if (!phone || !method || isNaN(amount)) {
    alert("📲 সব তথ্য সঠিকভাবে পূরণ করুন");
    return;
  }
  if (amount < 0.05 || balance < (amount + 0.05)) {
    alert("❌ পর্যাপ্ত ব্যালেন্স নেই!");
    return;
  }
  balance -= (amount + 0.05);
  saveData();
  updateUI();
  const username = telegramUser?.username || telegramUser?.first_name || 'N/A';
  const id = telegramUser?.id || 'N/A';
  fetch('/api/sendWithdraw', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ phone, method, amount, username, id })
  }).then(res => res.json())
    .then(data => {
      if (data.success) alert("✅ রিকোয়েস্ট পাঠানো হয়েছে!");
      else alert("❌ মেসেজ পাঠাতে সমস্যা হয়েছে!");
    }).catch(() => alert("❌ নেটওয়ার্ক সমস্যা!"));
}
loadData();
generateQuestion();
updateUI();
setInterval(checkCooldown, 1000);
