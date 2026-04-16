const DEFAULT_BASE_URL = "http://localhost:3000";

async function getBaseUrl() {
  const result = await chrome.storage.local.get("baseUrl");
  return result.baseUrl || DEFAULT_BASE_URL;
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "quick-save") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    try {
      const baseUrl = await getBaseUrl();
      await fetch(`${baseUrl}/api/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          url: tab.url,
          title: tab.title || tab.url,
        }),
      });
    } catch {
      // Silent fail for keyboard shortcut
    }
  }
});
