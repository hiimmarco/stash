// Save-to-Stash — Chrome extension service worker.
// When the toolbar icon is clicked, POSTs the current tab's URL + title
// to the configured Stash API endpoint, using the configured API key.

const DEFAULT_BASE_URL = "https://stash-alpha-five.vercel.app";

async function getConfig() {
  const { baseUrl, apiKey } = await chrome.storage.sync.get([
    "baseUrl",
    "apiKey",
  ]);
  return {
    baseUrl: (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    apiKey: apiKey || "",
  };
}

async function setBadge(tabId, text, color) {
  try {
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
    await chrome.action.setBadgeText({ tabId, text });
    setTimeout(() => {
      chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});
    }, 2500);
  } catch {
    /* tab may be gone — ignore */
  }
}

async function openOptions() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
  }
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.url) return;

  // Skip browser-internal URLs
  if (!/^https?:\/\//i.test(tab.url)) {
    await setBadge(tab.id, "!", "#b00020");
    return;
  }

  const { baseUrl, apiKey } = await getConfig();

  if (!apiKey) {
    await setBadge(tab.id, "?", "#b00020");
    openOptions();
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
        url: tab.url,
        title: tab.title || tab.url,
      }),
    });

    if (res.ok) {
      await setBadge(tab.id, "✓", "#16a34a");
    } else {
      console.error("Stash save failed:", res.status, await res.text());
      await setBadge(tab.id, String(res.status), "#b00020");
    }
  } catch (err) {
    console.error("Stash save error:", err);
    await setBadge(tab.id, "x", "#b00020");
  }
});
