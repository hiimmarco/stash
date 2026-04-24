const DEFAULT_BASE_URL = "https://stash-alpha-five.vercel.app";

const baseUrlInput = document.getElementById("baseUrl");
const apiKeyInput = document.getElementById("apiKey");
const saveBtn = document.getElementById("save");
const testBtn = document.getElementById("test");
const status = document.getElementById("status");

function setStatus(msg, kind) {
  status.textContent = msg || "";
  status.className = "status " + (kind || "");
}

async function load() {
  const { baseUrl, apiKey } = await chrome.storage.sync.get([
    "baseUrl",
    "apiKey",
  ]);
  baseUrlInput.value = baseUrl || DEFAULT_BASE_URL;
  apiKeyInput.value = apiKey || "";
}

async function save() {
  const baseUrl = (baseUrlInput.value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  const apiKey = apiKeyInput.value.trim();
  await chrome.storage.sync.set({ baseUrl, apiKey });
  setStatus("Saved.", "ok");
}

async function test() {
  setStatus("Testing…");
  const baseUrl = (baseUrlInput.value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setStatus("Enter an API key first.", "err");
    return;
  }
  try {
    const res = await fetch(`${baseUrl}/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: "https://example.com",
        title: "Stash extension connection test",
      }),
    });
    if (res.ok) {
      setStatus("Connected. A test link was saved.", "ok");
    } else {
      const txt = await res.text().catch(() => "");
      setStatus(`Failed: ${res.status} ${txt}`, "err");
    }
  } catch (err) {
    setStatus(`Network error: ${err.message}`, "err");
  }
}

saveBtn.addEventListener("click", save);
testBtn.addEventListener("click", test);
load();
