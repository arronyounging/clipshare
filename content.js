console.log('Content script loaded');

// 在文件顶部添加这个函数
function logMessage(message) {
  console.log(`[Share Extension]: ${message}`);
}

// 移除与选中文本相关的事件监听器和函数
// 移除 handleTextSelection, showShareButton, hideShareButton 函数

// 保留 generateShareCard 函数，但做一些修改
function generateShareCard() {
  logMessage("generateShareCard function called");
  hideShareButton();  // 隐藏分享按钮
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) {
    logMessage("No text selected");
    alert("请先选择要分享的文本");
    return false;
  }
  logMessage(`Selected text: ${selectedText.substring(0, 50)}...`);

  const card = document.createElement("div");
  card.className = "share-card";

  // 创建logo和插件名称容器
  const logoNameContainer = document.createElement("div");
  logoNameContainer.className = "share-card-logo-name";
  
  // 添加logo
  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL('icon48.png');
  logo.alt = "Logo";
  logo.className = "share-card-logo-img";
  logo.crossOrigin = "anonymous";  // 添加这一行
  logoNameContainer.appendChild(logo);

  // 添加插件名称
  const pluginName = document.createElement("span");
  pluginName.textContent = "ClipShare";
  pluginName.className = "share-card-plugin-name";
  logoNameContainer.appendChild(pluginName);

  // 将logo和名称容器加到卡片顶部
  card.appendChild(logoNameContainer);

  // 添加slogan
  const slogan = document.createElement("div");
  slogan.textContent = "The Smart Way to Share";
  slogan.className = "share-card-slogan";
  card.appendChild(slogan);

  // 添加选中的文字内容
  const quoteContainer = document.createElement("div");
  quoteContainer.className = "share-card-quote-container";
  const quoteContent = document.createElement("p");
  quoteContent.className = "share-card-quote";
  quoteContent.textContent = selectedText;
  quoteContainer.appendChild(quoteContent);
  card.appendChild(quoteContainer);

  // 添加网页信息和二维码容器
  const footerContainer = document.createElement("div");
  footerContainer.className = "share-card-footer-container";

  // 添加网页信息
  const siteInfo = document.createElement("div");
  siteInfo.className = "share-card-site-info";

  const faviconAndUrl = document.createElement("div");
  faviconAndUrl.className = "share-card-favicon-url";

  const favicon = document.createElement("img");
  favicon.src = getFaviconUrl();
  favicon.className = "share-card-favicon";
  favicon.crossOrigin = "anonymous";  // 添加这一行
  faviconAndUrl.appendChild(favicon);

  const siteUrl = document.createElement("div");
  siteUrl.className = "share-card-site-url";
  siteUrl.textContent = window.location.hostname;
  faviconAndUrl.appendChild(siteUrl);

  siteInfo.appendChild(faviconAndUrl);

  const siteName = document.createElement("div");
  siteName.className = "share-card-site-name";
  siteName.textContent = document.title;
  siteInfo.appendChild(siteName);

  footerContainer.appendChild(siteInfo);

  // 添加二维码
  const qrCodeContainer = document.createElement("div");
  qrCodeContainer.className = "share-card-qrcode";
  new QRCode(qrCodeContainer, {
    text: window.location.href,
    width: 40,
    height: 40
  });

  footerContainer.appendChild(qrCodeContainer);
  card.appendChild(footerContainer);

  // 创建按钮容器
  const actionsContainer = document.createElement("div");
  actionsContainer.className = "share-card-actions";

  // 创建复制按钮
  const copyButton = document.createElement("button");
  copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  copyButton.className = "share-card-action-button share-card-copy";
  copyButton.onclick = function() {
    copyShareCard(card);
  };
  actionsContainer.appendChild(copyButton);

  // 创建下载按钮
  const downloadButton = document.createElement("button");
  downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
  downloadButton.className = "share-card-action-button share-card-download";
  downloadButton.onclick = function() {
    downloadShareCard(card);
  };
  actionsContainer.appendChild(downloadButton);

  // 创建关闭按钮
  const closeButton = document.createElement("button");
  closeButton.innerHTML = '&times;';
  closeButton.className = "share-card-action-button share-card-close";
  closeButton.onclick = function() {
    closeShareCard();
  };
  actionsContainer.appendChild(closeButton);

  // 将按钮容器添加到卡片
  card.appendChild(actionsContainer);

  // 阻止卡片上的点击事件冒泡
  card.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  document.body.appendChild(card);

  // 添加document级别的点击事件监听器
  document.addEventListener('click', closeShareCardOnOutsideClick);

  // 更新样式
  const style = document.createElement('style');
  style.textContent = `
    .share-card {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      background-color: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      padding: 20px;
      font-family: Arial, sans-serif;
      z-index: 9999;
      display: flex;
      flex-direction: column;
    }
    .share-card-logo-name {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      padding-right: 80px; /* 为右侧按钮留出空间 */
    }
    .share-card-logo-img {
      width: 24px;
      height: 24px;
      margin-right: 10px;
    }
    .share-card-plugin-name {
      font-weight: bold;
      font-size: 18px;
    }
    .share-card-slogan {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    .share-card-quote-container {
      background-color: #f3f5fb;
      border-radius: 10px;
      padding: 15px 5px;
      margin-bottom: 10px;
    }
    .share-card-quote {
      font-size: 10pt;
      line-height: 13pt;
      color: #333;
      margin: 0;
      text-align: justify;
      text-justify: inter-word;
      padding: 0 5px;
    }
    .share-card-footer-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 10px;
    }
    .share-card-site-info {
      flex: 1;
      min-width: 0;
      margin-right: 10px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .share-card-favicon-url {
      display: flex;
      align-items: center;
      height: 25px;
      margin-bottom: 5px;
    }
    .share-card-favicon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .share-card-site-url {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .share-card-site-name {
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    .share-card-qrcode {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }
    .share-card-qrcode img {
      width: 100%;
      height: 100%;
    }
    .share-card-actions {
      position: absolute;
      top: 20px; /* 调整为与 logo 上边缘对齐 */
      right: 20px;
      display: flex;
      gap: 5px; /* 减小按钮间的间距 */
    }
    .share-card-action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px; /* 稍微减小按钮大小 */
      height: 24px;
      border-radius: 50%;
      background-color: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.3s;
    }
    .share-card-action-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    .share-card-action-button svg {
      width: 16px; /* 稍微减小图标大小 */
      height: 16px;
    }
    .share-card-close {
      font-size: 20px; /* 调整关闭按钮的字体大小 */
      line-height: 1;
    }
  `;
  document.head.appendChild(style);

  logMessage("Share card created and appended to body");
  return true;
}

function getFaviconUrl() {
  const favicon = document.querySelector('link[rel="shortcut icon"]') ||
                  document.querySelector('link[rel="icon"]');
  if (favicon) {
    return favicon.href;
  } else {
    // 如果没有找到 favicon，使用一个默认的图标
    return chrome.runtime.getURL('default_favicon.png');
  }
}

function downloadShareCard(cardElement) {
  logMessage("Download function triggered");
  
  const scale = 1.5; // 保持较高的图片质量
  const padding = 20; // 透明留白的宽度

  // 创建卡片的克隆，以便我们可以修改它而不影响原始卡片
  const clonedCard = cardElement.cloneNode(true);
  
  // 隐藏操作按钮
  const actionsContainer = clonedCard.querySelector('.share-card-actions');
  if (actionsContainer) {
    actionsContainer.style.display = 'none';
  }

  // 将克隆的卡片添加到一个新的包装器中
  const wrapper = document.createElement('div');
  wrapper.style.padding = `${padding}px`;
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.zIndex = '-9999';
  wrapper.style.background = 'transparent';
  wrapper.appendChild(clonedCard);
  document.body.appendChild(wrapper);

  // 确保所有图像都已加载
  const images = wrapper.querySelectorAll('img');
  Promise.all(Array.from(images).map(img => {
    if (img.complete) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    }
  })).then(() => {
    // 使用 html2canvas 捕获卡片内容
    html2canvas(clonedCard, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true
    }).then(canvas => {
      // 创建一个新的画布，包括内边距
      const paddedCanvas = document.createElement('canvas');
      paddedCanvas.width = (clonedCard.offsetWidth + padding * 2) * scale;
      paddedCanvas.height = (clonedCard.offsetHeight + padding * 2) * scale;
      const ctx = paddedCanvas.getContext('2d');

      // 绘制阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 绘制圆角矩形
      const radius = 10 * scale; // 圆角半径
      ctx.beginPath();
      ctx.moveTo(padding * scale + radius, padding * scale);
      ctx.lineTo(paddedCanvas.width - padding * scale - radius, padding * scale);
      ctx.quadraticCurveTo(paddedCanvas.width - padding * scale, padding * scale, paddedCanvas.width - padding * scale, padding * scale + radius);
      ctx.lineTo(paddedCanvas.width - padding * scale, paddedCanvas.height - padding * scale - radius);
      ctx.quadraticCurveTo(paddedCanvas.width - padding * scale, paddedCanvas.height - padding * scale, paddedCanvas.width - padding * scale - radius, paddedCanvas.height - padding * scale);
      ctx.lineTo(padding * scale + radius, paddedCanvas.height - padding * scale);
      ctx.quadraticCurveTo(padding * scale, paddedCanvas.height - padding * scale, padding * scale, paddedCanvas.height - padding * scale - radius);
      ctx.lineTo(padding * scale, padding * scale + radius);
      ctx.quadraticCurveTo(padding * scale, padding * scale, padding * scale + radius, padding * scale);
      ctx.closePath();

      // 填充白色背景
      ctx.fillStyle = 'white';
      ctx.fill();

      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 绘制卡片内容
      ctx.drawImage(canvas, padding * scale, padding * scale);

      // 转换canvas为blob并下载
      paddedCanvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          chrome.runtime.sendMessage({
            action: 'download',
            url: url,
            filename: 'share_card.png'
          }, response => {
            if (response && response.success) {
              logMessage("Download successful");
              showDownloadNotification();
            } else {
              logMessage("Download failed: " + (response ? response.error : "Unknown error"));
            }
            URL.revokeObjectURL(url);
          });
        } else {
          logMessage("Failed to create blob from canvas");
        }
        // 清理：移除临时添加的元素
        document.body.removeChild(wrapper);
      }, 'image/png');
    }).catch(error => {
      logMessage("Error in html2canvas: " + error);
      document.body.removeChild(wrapper);
    });
  }).catch(error => {
    logMessage("Error loading images: " + error);
    document.body.removeChild(wrapper);
  });
}

function showDownloadNotification() {
  const card = document.querySelector('.share-card');
  if (!card) return;

  const notification = document.createElement('div');
  notification.className = 'ios-style-notification';
  notification.textContent = 'Download Complete!';
  
  // 将通知插入到 body 中，而不是卡片内部
  document.body.appendChild(notification);

  // 计算通知的位置
  const cardRect = card.getBoundingClientRect();
  notification.style.left = `${cardRect.left + (cardRect.width - notification.offsetWidth) / 2}px`;
  notification.style.top = `${cardRect.top - notification.offsetHeight - 10}px`; // 10px 为与卡片的间距

  // 显示通知
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 100);

  // 隐藏并移除通知
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// 修改通知样式
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
  .ios-style-notification {
    position: fixed;
    z-index: 10000;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.3s, transform 0.3s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;
document.head.appendChild(notificationStyle);

function copyShareCard(cardElement) {
  const cardText = cardElement.querySelector('.share-card-quote').textContent;
  const siteInfo = cardElement.querySelector('.share-card-site-name').textContent;
  const siteUrl = cardElement.querySelector('.share-card-site-url').textContent;
  
  const textToCopy = `"${cardText}"\n\n来源：${siteInfo}\n${siteUrl}`;
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    showNotification('Copy Successful!', 'success');
  }).catch(err => {
    console.error('复制失败:', err);
    showNotification('Copy Failed', 'error');
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = 'ios-style-notification';
  notification.textContent = message;
  notification.style.backgroundColor = type === 'success' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
  notification.style.fontWeight = 'normal';
  notification.style.padding = '8px 16px';

  document.body.appendChild(notification);

  const card = document.querySelector('.share-card');
  if (card) {
    const cardRect = card.getBoundingClientRect();
    notification.style.left = `${cardRect.left + (cardRect.width - notification.offsetWidth) / 2}px`;
    notification.style.top = `${cardRect.top - notification.offsetHeight - 10}px`;
  }

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 100);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// 新增函数：关闭分享卡片
function closeShareCard() {
  const card = document.querySelector('.share-card');
  if (card) {
    document.body.removeChild(card);
    // 移除document级别的点击事件监听器
    document.removeEventListener('click', closeShareCardOnOutsideClick);
    // 重新显示分享按钮
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      showShareButton(selection);
    }
  }
}

// 新增函数：点击外部区域时关闭卡片
function closeShareCardOnOutsideClick(e) {
  const card = document.querySelector('.share-card');
  if (card && !card.contains(e.target)) {
    closeShareCard();
  }
}

// 修改消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  logMessage("Message received in content script");
  if (request.action === "generateCard") {
    logMessage("Generating share card");
    const success = generateShareCard();
    logMessage(`Share card generation ${success ? 'successful' : 'failed'}`);
    sendResponse({success: success});
  }
  return true;  // 保持消息通道开放
});

// 在文件末尾添加这段代码进行测试
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'q') {  // 按 Ctrl+Q 触发
    logMessage("Manual trigger of generateShareCard");
    generateShareCard();
  }
});

let shareButton = null;

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('selectionchange', handleTextSelection);

function handleTextSelection() {
  const selection = window.getSelection();
  if (selection.toString().trim().length > 0) {
    showShareButton(selection);
  } else {
    hideShareButton();
  }
}

function showShareButton(selection) {
  if (!shareButton) {
    shareButton = document.createElement('div');
    shareButton.id = 'share-card-button';
    shareButton.innerHTML = '<img src="' + chrome.runtime.getURL('icon48.png') + '" alt="Share">';
    shareButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      generateShareCard();
    });
    document.body.appendChild(shareButton);
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  shareButton.style.left = rect.left + window.pageXOffset + 'px';
  shareButton.style.top = rect.bottom + window.pageYOffset + 'px';
  shareButton.style.display = 'block';
}

function hideShareButton() {
  if (shareButton) {
    shareButton.style.display = 'none';
  }
}

const shareButtonStyle = document.createElement('style');
shareButtonStyle.textContent = `
  #share-card-button {
    position: absolute;
    z-index: 9999;
    background-color: white;
    border: none;
    border-radius: 50%;
    padding: 5px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: none;
  }
  #share-card-button img {
    width: 24px;
    height: 24px;
    display: block;
  }
`;
document.head.appendChild(shareButtonStyle);

// 调试信息
console.log('Share button:', shareButton);
console.log('generateShareCard function:', generateShareCard);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureAndDownload') {
    html2canvas(document.querySelector('.share-card')).then(canvas => {
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          chrome.runtime.sendMessage({
            action: 'download',
            url: url,
            filename: 'share_card.png'
          });
        }
      }, 'image/png');
    });
  }
});