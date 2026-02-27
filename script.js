const screen = document.getElementById("screen");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");

let expr = ""; // expressão atual
let lastResult = null;

function setScreen(value) {
  screen.value = value;
}

function formatExprForHistory(s) {
  return s
    .replaceAll("*", "×")
    .replaceAll("/", "÷")
    .replaceAll("-", "−");
}

function safeEval(expression) {
  // Bloqueia caracteres estranhos
  if (!/^[0-9+\-*/%.() ]+$/.test(expression)) return null;

  // Trata % como "porcentagem do número" (ex: 50% => 0.5)
  const normalized = expression.replace(/(\d+(\.\d+)?)%/g, "($1/100)");

  try {
    // new Function evita acesso a escopo externo e é mais controlável aqui
    const result = Function(`"use strict"; return (${normalized});`)();
    if (Number.isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
}

function appendValue(v) {
  // Evita dois pontos seguidos no mesmo número
  if (v === ".") {
    const parts = expr.split(/[\+\-\*\/]/);
    const last = parts[parts.length - 1];
    if (last.includes(".")) return;
    if (last === "") expr += "0";
  }

  // Se expressão vazia e clicar operador, não deixa (exceto -)
  if (expr === "" && ["+", "*", "/", "%"].includes(v)) return;

  expr += v;
  setScreen(expr);
}

function clearAll() {
  expr = "";
  lastResult = null;
  historyEl.textContent = "";
  setScreen("0");
}

function backspace() {
  expr = expr.slice(0, -1);
  setScreen(expr || "0");
}

function equals() {
  if (!expr) return;

  const result = safeEval(expr);
  if (result === null) {
    historyEl.textContent = "Erro";
    setScreen("0");
    expr = "";
    return;
  }

  historyEl.textContent = formatExprForHistory(expr) + " =";
  lastResult = result;

  // Limita casas decimais
  const pretty = Number.isInteger(result) ? String(result) : String(+result.toFixed(10));
  setScreen(pretty);

  // permite continuar calculando a partir do resultado
  expr = String(result);
}

keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  if (action === "clear") return clearAll();
  if (action === "back") return backspace();
  if (action === "equals") return equals();
  if (value) return appendValue(value);
});

// Teclado
document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k === "Enter") return equals();
  if (k === "Escape") return clearAll();
  if (k === "Backspace") return backspace();

  if ("0123456789.+-*/()%".includes(k)) {
    e.preventDefault();
    appendValue(k);
  }
});
