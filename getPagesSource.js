function resolveUrl(url) {
  if(url.includes("http")) {
    return url;
  } else {
    return `${window.location.protocol}//${window.location.host}/${url}`;
  }
}

chrome.runtime.sendMessage({
  action: "getImageUrls",
  urls: (() => {
    const images = document.querySelectorAll("img");
    const urls = [];
    for (let i = 0; i < images.length; ++i) {
      const img = images[i];
      const url = img.getAttribute("src");
      urls.push(resolveUrl(url));
    }

    console.log('Detected urls:', urls);
    return urls;
  })()
});