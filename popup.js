const cache = {
  urls: [],
  urlContainsFilter: '',
  dryRun: true
}

function getFilteredUrls() {
  info(`Filter ${cache.urls.length} urls by: ${cache.urlContainsFilter}`);
  const matchedUrls = cache.urls
  .filter(url => url.includes(cache.urlContainsFilter));
  return matchedUrls;
}

function refresh() {

  const matchedUrls = getFilteredUrls();
  updateDownloadButton(matchedUrls.length);
  updateImages(matchedUrls);
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getImageUrls") {
    cache.urls = request.urls;
    refresh();
  }
});


function updateDownloadButton(countOfImages) {
  const btn = document.getElementById('btn-download');
  btn.setAttribute('value', `Download ${countOfImages} images`);
}

function updateImages(urls) {

  const container = document.getElementById('image-container');
  container.innerHTML = '';

  const template = document.querySelector('#item');
  const img = template.content.querySelector('img');
  const text = template.content.querySelector('.text');


  urls.forEach(url => {
    img.setAttribute('src', url);
    text.textContent = url;
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

  const matchedUrls = getFilteredUrls();
  info(`Going to download ${matchedUrls.length} images`);

  if(!cache.dryRun) {
    chrome.runtime.sendMessage({
      action: "downloadImages",
      urls: matchedUrls
    }, function(response) {
      if( response != null && response != undefined ) {
        // Get message response from receiver
      }
    });
  }
}

function onWindowLoad() {

  var message = document.querySelector('#message');

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
  urlContainsFilterInput.addEventListener('change', event => {
    const value = event.target.value;
    info(`filter-url-containers: ${value}`);
    cache.urlContainsFilter = value;
    refresh();
  });

  const downloadButton = document.getElementById('btn-download');
  downloadButton.addEventListener('click', onDownloadButtonClick);

}

window.onload = onWindowLoad;