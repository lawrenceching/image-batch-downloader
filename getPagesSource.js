function resolveUrl(url) {
  if(url.includes("http")) {
    return url;
  } else {
    return `${window.location.protocol}//${window.location.host}/${url}`;
  }
}

chrome.runtime.sendMessage({
  action: "getImageUrls",
  images: (() => {
    const imgElements = document.querySelectorAll("img");
    const images = [];
    for (let i = 0; i < imgElements.length; ++i) {
      const img = imgElements[i];
      const url = img.getAttribute("src");

      images.push({
        url: resolveUrl(url),
        naturalHeight: img.naturalHeight,
        naturalWidth: img.naturalWidth,
        clientHeight: img.clientHeight,
        clientWidth: img.clientWidth
      });
    }

    console.log('Detected images:', images);
    return images;
  })()
});