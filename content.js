chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "copyContent") {
    const selectedText = window.getSelection().toString();
    let imageUrls = [];

    // 選択範囲内の画像URLを取得
    if (window.getSelection().rangeCount > 0) {
      const selectedRange = window.getSelection().getRangeAt(0);
      const images = selectedRange.cloneContents().querySelectorAll("img");
      imageUrls = Array.from(images).map(img => img.src);
    }

    // 右クリックで取得した画像URLがあれば追加
    if (request.imageUrl) {
      imageUrls.push(request.imageUrl);
    }

    // 以前のデータを `chrome.storage.local` から取得して連結
    chrome.storage.local.get(["storedImageUrls"], function(data) {
      let storedUrls = data.storedImageUrls ? data.storedImageUrls.split(";") : [];
      storedUrls = storedUrls.concat(imageUrls);
      const imageUrlsString = storedUrls.filter(Boolean).join(";"); // 空の要素を削除して `;` で連結

      // クリップボードにコピー
      const fullContent = [selectedText, imageUrlsString].filter(Boolean).join("\n");
      if (fullContent) {
        navigator.clipboard.writeText(fullContent);
      }

      // `chrome.storage.local` に保存（次回の操作時にも使うため）
      chrome.storage.local.set({ storedImageUrls: imageUrlsString });

      sendResponse({ status: "success", copiedText: fullContent });
    });

    return true; // 非同期処理のため `true` を返す
  }
});
