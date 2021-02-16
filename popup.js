const cache = {
  images: [],
  urlContainsFilter: '',
  imageHeightFilter: '',
  imageWidthFilter: '',
  dryRun: false,
  debug: false
}

function getFilteredImages() {
  info(`Filter ${cache.images.length} urls by: ${cache.urlContainsFilter}`);
  const matchedUrls = cache.images
  .filter(img => img.url.includes(cache.urlContainsFilter))
      .filter(img => cache.imageWidthFilter === 0 || img.naturalWidth >= cache.imageWidthFilter)
      .filter(img => cache.imageHeightFilter === 0 || img.naturalHeight >= cache.imageHeightFilter)
  ;
  return matchedUrls;
}

function refresh() {

  const filteredImages = getFilteredImages();
  updateDownloadButton(filteredImages.length);
  updateImages(filteredImages);

}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action === "getImageUrls") {
    cache.images = request.images;
    refresh();
  }
});

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


function updateDownloadButton(countOfImages) {
  const btn = document.getElementById('btn-download');
  btn.setAttribute('value', `Download ${countOfImages} images`);
}

function updateImages(images) {

  const container = document.getElementById('image-container');
  container.innerHTML = '';

  const template = document.querySelector('#item');
  const img = template.content.querySelector('img');
  const text = template.content.querySelector('.text');


  images.forEach(image => {
    img.setAttribute('src', image.url);
    text.textContent = `${JSON.stringify(image)}`;
    container.appendChild(document.importNode(template.content, true))
  })

}

function info(msg) {
  const div = document.createElement('div');
  div.textContent = msg;
  document.getElementById('message').appendChild(div)
}

function onDownloadButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();

  const filteredImages = getFilteredImages();
  info(`Going to download ${filteredImages.length} images`);

  if(!cache.dryRun) {
    chrome.runtime.sendMessage({
      action: "downloadImages",
      urls: filteredImages.map(image => image.url)
    }, function(response) {
      if( response !== null && response !== undefined ) {
        // Get message response from receiver
      }
    });
  }
}

function onImageWidthFilterInput(event) {
  const value = event.target.value;
  info(`Set image width filter: ${value}`);

  if(isNumeric(value)) {
    cache.imageWidthFilter = value;
  } else {
    info(`Image width filter was set to invalid number \"${value}\", reset to 0`);
    cache.imageWidthFilter = 0;
  }

  refresh();
}

function onImageHeightFilterInput(event) {
  const value = event.target.value;
  info(`Set image height filter: ${value}`);

  if(isNumeric(value)) {
    cache.imageHeightFilter = value;
  } else {
    info(`Image height filter was set to invalid number \"${value}\", reset to 0`);
    cache.imageHeightFilter = 0;
  }

  refresh();
}

function onUrlContainsFilterInput(event) {
  const value = event.target.value;
  info(`Set URL-contains filter: ${value}`);
  cache.urlContainsFilter = value;
  refresh();
}

function onWindowLoad() {

  const message = document.querySelector('#message');
  if(!!cache.debug) {
    message.show()
  } else {
    message.hide()
  }


  console.log('Starting execution script')
  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

  const urlContainsFilterInput = document.getElementById('filter-url-containers');
  urlContainsFilterInput.addEventListener('input', onUrlContainsFilterInput);;

  const imageWidthFilterInput = document.getElementById('filter-image-width');
  imageWidthFilterInput.addEventListener('input', onImageWidthFilterInput);

  const imageHeightFilterInput = document.getElementById('filter-image-height');
  imageHeightFilterInput.addEventListener('input', onImageHeightFilterInput);

  const downloadButton = document.getElementById('btn-download');
  downloadButton.addEventListener('click', onDownloadButtonClick);

}

window.onload = onWindowLoad;