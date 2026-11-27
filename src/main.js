const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const $ = (id) => document.getElementById(id);
const state = { mode: "buy" };

const format = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits }).format(value);

function createCoins() {
  const layer = $("coinLayer");
  for (let i = 0; i < 17; i += 1) {
    const coin = document.createElement("span");
    coin.className = "floating-coin";
    coin.textContent = "BC";
    coin.style.left = `${(i * 37 + 8) % 100}%`;
    coin.style.animationDuration = `${18 + (i % 7) * 4}s`;
    coin.style.animationDelay = `-${(i * 3) % 23}s`;
    coin.style.setProperty("--drift", `${(i % 2 ? 1 : -1) * (12 + (i % 5) * 8)}px`);
    coin.style.setProperty("--coin-opacity", String(0.08 + (i % 4) * 0.025));
    layer.appendChild(coin);
  }
}
createCoins();

function openModal(mode) {
  state.mode = mode;
  const buy = mode === "buy";
  $("modalKicker").textContent = buy ? "ПОКУПКА BYTECOIN" : "ПРОДАЖА BYTECOIN";
  $("modalTitle").textContent = buy ? "Купить BC" : "Продать BC";
  $("modalDescription").textContent = buy
    ? "Укажи сумму в рублях — рассчитаем количество BC."
    : "Укажи количество BC — рассчитаем сумму в рублях.";
  $("amountLabel").textContent = buy ? "СУММА В РУБЛЯХ" : "КОЛИЧЕСТВО BYTECOIN";
  $("amountUnit").textContent = buy ? "₽" : "BC";
  $("amountInput").placeholder = buy ? "0.00" : "0";
  $("amountInput").value = "";
  $("estimateValue").textContent = buy ? "0 BC" : "0 ₽";
  $("modalRate").textContent = buy
    ? "Курс: 10 ₽ за 1 000 000 BC"
    : "Курс: 6 ₽ за 1 000 000 BC";
  $("confirmBtn").className = `confirm-button ${buy ? "confirm-buy" : "confirm-sell"}`;
  $("modalBackdrop").classList.add("visible");
  $("modalBackdrop").setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => $("amountInput").focus(), 120);
}

function closeModal() {
  $("modalBackdrop").classList.remove("visible");
  $("modalBackdrop").setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function updateEstimate() {
  const amount = Number($("amountInput").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    $("estimateValue").textContent = state.mode === "buy" ? "0 BC" : "0 ₽";
    return;
  }
  const estimate = state.mode === "buy" ? amount * 100000 : amount / 1000000 * 6;
  $("estimateValue").textContent = state.mode === "buy"
    ? `${format(estimate, 0)} BC`
    : `${format(estimate, 2)} ₽`;
}

$("buyBtn").addEventListener("click", () => openModal("buy"));
$("sellBtn").addEventListener("click", () => openModal("sell"));
$("closeModal").addEventListener("click", closeModal);
$("modalBackdrop").addEventListener("click", (event) => {
  if (event.target === $("modalBackdrop")) closeModal();
});
$("amountInput").addEventListener("input", updateEstimate);
$("confirmBtn").addEventListener("click", () => {
  const amount = Number($("amountInput").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    $("amountInput").focus();
    $("amountInput").classList.add("invalid");
    setTimeout(() => $("amountInput").classList.remove("invalid"), 500);
    return;
  }
  closeModal();
  showToast("Интерфейс готов. Для реального обмена нужно подключить сервер заявок и учёт резервов.");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4200);
}
