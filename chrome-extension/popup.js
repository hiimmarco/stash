const DEFAULT_BASE_URL = "http://localhost:3000";

async function getBaseUrl() {
  const result = await chrome.storage.local.get("baseUrl");
  return result.baseUrl || DEFAULT_BASE_URL;
}

function detectType(url) {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be"))
      return { type: "video", platform: "YouTube", icon: "\u25B6\uFE0F" };
    if (hostname.includes("spotify.com"))
      return { type: "podcast", platform: "Spotify", icon: "\uD83C\uDFA7" };
    if (hostname.includes("vimeo.com"))
      return { type: "video", platform: "Vimeo", icon: "\u25B6\uFE0F" };
    if (hostname.includes("podcasts.apple.com"))
      return { type: "podcast", platform: "Apple Podcasts", icon: "\uD83C\uDFA7" };
    return { type: "article", platform: hostname, icon: "\uD83D\uDCC4" };
  } catch {
    return { type: "article", platform: "Unknown", icon: "\uD83D\uDCC4" };
  }
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const title = tab.title || url;

  document.getElementById("urlBox").textContent = url;

  const detected = detectType(url);
  document.getElementById("typeIcon").textContent = detected.icon;
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageMeta").textContent = `${detected.type} \u00B7 ${detected.platform}`;
  document.getElementById("detected").style.display = "flex";

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = false;

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const baseUrl = await getBaseUrl();
      const res = await fetch(`${baseUrl}/api/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, title }),
      });

      document.getElementById("mainView").style.display = "none";
      const statusView = document.getElementById("statusView");
      const statusContent = document.getElementById("statusContent");
      statusView.style.display = "block";

      if (res.ok) {
        statusContent.className = "status success";
        statusContent.innerHTML =
          '<div class="status-icon">\u2713</div><div class="status-text">Saved to Stash</div>';
        setTimeout(() => window.close(), 1200);
      } else {
        statusContent.className = "status error";
        statusContent.innerHTML =
          '<div class="status-icon">\u26A0\uFE0F</div><div class="status-text">Failed to save. Are you logged in?</div>';
      }
    } catch {
      document.getElementById("mainView").style.display = "none";
      const statusView = document.getElementById("statusView");
      const statusContent = document.getElementById("statusContent");
      statusView.style.display = "block";
      statusContent.className = "status error";
      statusContent.innerHTML =
        '<div class="status-icon">\u26A0\uFE0F</div><div class="status-text">Cannot connect to Stash</div>';
    }
  });

  // Settings toggle
  const settingsToggle = document.getElementById("settingsToggle");
  const settingsView = document.getElementById("settingsView");
  const mainView = document.getElementById("mainView");
  const baseUrlInput = document.getElementById("baseUrlInput");

  const baseUrl = await getBaseUrl();
  baseUrlInput.value = baseUrl;

  settingsToggle.addEventListener("click", () => {
    const showing = settingsView.style.display !== "none";
    settingsView.style.display = showing ? "none" : "block";
    mainView.style.display = showing ? "block" : "none";
    settingsToggle.textContent = showing ? "Settings" : "Back";
  });

  document.getElementById("settingsSaveBtn").addEventListener("click", async () => {
    const newUrl = baseUrlInput.value.replace(/\/+$/, "");
    await chrome.storage.local.set({ baseUrl: newUrl });
    settingsView.style.display = "none";
    mainView.style.display = "block";
    settingsToggle.textContent = "Settings";
  });
}

init();
