chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'fetchPageContent':
            console.log("Retrieving content for page: " + message.url);
            fetch(message.url)
                .then(response => {
                    if (response.ok) {
                        return response.text();  // This returns a Promise<string>
                    }
                    throw new Error('Network response was not ok for ' + message.url);
                })
                .then(html => {
                    console.log(html);
                    sendResponse({data: html});
                })
                .catch(error => {
                    console.error('Problem with retrieving the source url details:', error);
                    sendResponse({data: null, error: error.message});
                });
            break;
        case 'getClaimsValidationReport':
            console.log("Getting claims validation report from text:\n" + message.commentText);
            fetch(process.env.LLM_CLAIM_VALIDATION_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message.commentText,
                    source: message.sourceText,
                }),
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response from LLM server was not ok');
                }
                return response.json();
            }).then(data => {
                if (!data.hasOwnProperty('report')) {
                    throw new Error('Claim validation report found in response from LLM server: ' + data);
                }
                sendResponse({data: data['report']});
            }).catch(error => {
                console.error('Issue with calling the LLM server', error);
                sendResponse({data: null, error: error.message});
            });
            break;
    }
    return true;  // Keep the channel open for the asynchronous sendResponse
});
