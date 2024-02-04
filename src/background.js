chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Retrieving content for page:" + request.url);
    fetch(request.url)
        .then(response => {
            if (response.ok) {
                return response.text();  // This returns a Promise<string>
            }
            throw new Error('Network response was not ok for ' + request.url);
        })
        .then(html => {
            console.log(html);
            sendResponse({data: html});
        })
        .catch(error => {
            console.error('Problem with retrieving the source url details:', error);
            sendResponse({data: null, error: error.message});
        });

    return true;  // Keep the channel open for the asynchronous sendResponse
});
