function guessFileName(url) {
  const words = url.split('/');
  const filename = words[words.length - 1];
  return filename;
}
let count = 0;
let id = 0;
const tasks = [];
function download(url) {
  if(null !== url) {
    tasks.push(url);
    console.log(`Push ${url} to the queues(${tasks.length})`);
  }

  console.log('> count', count);
  if(count <= 4) {

    const _url = tasks.pop();

    if(_url !== undefined) {

      count++;
      const _id = id++;
      console.log(`[${_id}] count++, count=${count}`)
      console.log(`Pop ${_url} from the queues(${tasks.length})`);

      console.log('Downloading ', _url);
      chrome.downloads.download({
        url: _url,
        saveAs: false,
        conflictAction: 'prompt'
      }, (downloadId) => {
        if(downloadId === undefined) {
          console.log(`Unable to download image because of`, chrome.runtime.lastError)
        } else {
          console.log(`Received download ${downloadId}`);
        }
        count--;
        console.log(`[${_id}] count--, count=${count}`)
        console.log('Download completed, there are tasks on the queue', tasks);
        download(null);
      });
    }
  }
}

chrome.runtime.onInstalled.addListener(function() {
  console.log(`Image Batch Downloader installed`);

  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {


        switch (request.action) {
          case 'downloadImage':
            const url = request.url;
            // console.log(`Downloading image ${url} to ${filename}`);
            download(url);
            sendResponse({
              text: 'Started to download image ' + url
            });

            break;
          case 'downloadImages':
            const urls = request.urls;
            console.log(`${urls.length} images are about to download`);
            urls.forEach(url => download(url));
            break;
          default:
            console.error('Unknown action', request.action)
            sendResponse({
              text: 'Unknown message action'
            });
        }

        return true;
      });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          // pageUrl: {hostEquals: 'developer.chrome.com'},
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});