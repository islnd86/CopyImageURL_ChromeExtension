chrome.runtime.onInstalled.addListener(() => {
  // コピー用のメニュー
  chrome.contextMenus.create({
    id: "copyTextAndImage",
    title: "テキストと画像URLをコピー",
    contexts: ["selection", "image"]
  });

  // バッファクリア用のメニュー
  chrome.contextMenus.create({
    id: "clearBuffer",
    title: "画像URLの連結をクリア",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyTextAndImage") {
    if (tab && tab.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Failed to inject content script:", chrome.runtime.lastError.message);
          return;
        }

        chrome.tabs.sendMessage(tab.id, {
          action: "copyContent",
          imageUrl: info.srcUrl || null
        }, function (response) {
          if (chrome.runtime.lastError) {
            console.error("Message failed:", chrome.runtime.lastError.message);
          } else {
            console.log("Message response:", response);
          }
        });
      });
    } else {
      console.error("Invalid tab, cannot send message.");
    }
  } else if (info.menuItemId === "clearBuffer") {
    // ストレージをクリアする処理
    chrome.storage.local.remove("storedImageUrls", () => {
      console.log("画像URLの連結バッファをクリアしました");
    });
  }
});
