chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getImageUrls") {

    const urls = request.urls;

    const matchedUrls = urls
    .filter(url => url.endsWith(".jpg"))
    .filter(url => url.startsWith("http://wk009.com"));

    message.innerText = matchedUrls.join("\n");

    chrome.runtime.sendMessage({
      action: "downloadImages",
      urls: matchedUrls
    }, function(response) {
      if( response != null && response != undefined ) {
        // Get message response from receiver
      }
    });

  }
});

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

}

window.onload = onWindowLoad;