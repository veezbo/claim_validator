export async function getClaimsValidationReport(commentText, sourceText) {
    return new Promise((resolve, reject) => {
        // Send a message to the background script
        chrome.runtime.sendMessage(
            {type: 'getClaimsValidationReport', commentText: commentText, sourceText: sourceText}, response => {
            if (response.data === null) {
                reject('Null response from background script: ' + response.error);
                return;
            }
            resolve(response.data);
        });
    });
}
