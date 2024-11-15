chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Received message in background:", request.action);
  if (request.action === "captureCard") {
    console.log("Capturing card");
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
      console.log("Card captured, sending response");
      sendResponse({dataUrl: dataUrl});
    });
    return true;  // 保持消息通道开放
  } else if (request.action === "downloadCard") {
    console.log("Downloading card");
    chrome.downloads.download({
      url: request.dataUrl,
      filename: 'share-card.png',
      saveAs: true
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error("Download error: ", chrome.runtime.lastError);
        sendResponse({success: false, error: chrome.runtime.lastError});
      } else {
        console.log("Download started with id: ", downloadId);
        sendResponse({success: true, downloadId: downloadId});
      }
    });
    return true;  // 保持消息通道开放
  } else if (request.action === 'download') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: false
    }, downloadId => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
        sendResponse({success: false, error: chrome.runtime.lastError.message});
      } else {
        console.log('Download started with id:', downloadId);
        sendResponse({success: true, downloadId: downloadId});
      }
    });
    return true; // 保持消息通道开放
  }

  if (request.action === 'fetchImage') {
    fetch(request.url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = function() {
          sendResponse({dataUrl: reader.result});
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error fetching image:', error);
        sendResponse({error: error.toString()});
      });
    return true;  // 保持消息通道开放
  }
});

console.log('Background script loaded');