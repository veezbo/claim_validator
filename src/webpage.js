export function extractText(url) {
    console.log("Extracting text from url: " + url);
    let hash = null;
    let base_url = url;
    if (url.includes('#')) {
        hash = url.split('#')[1];
        base_url = url.split('#')[0];
    }

    return new Promise((resolve, reject) => {
        // Send a message to the background script
        chrome.runtime.sendMessage({url: base_url}, response => {
            if (response.data === null) {
                reject('Null response from background script: ' + response.error);
                return;
            }

            // Handle the response from the background script
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.data, 'text/html');
            console.log(doc.body);

            if (hash === null) {
                const text = getTextFromHTMLElement(doc.body);
                console.log(text);
                resolve(text);
            } else {
                // Find the element by its ID using the hash
                const element = doc.getElementById(hash);
                if (element) {
                    // Use the innerText or textContent property to get the text content of the element
                    const text = getTextFromHTMLElement(element);
                    console.log(text);
                    resolve(text);
                } else {
                    console.log('Expected element not found');
                    reject('Element not found');
                }
            }
        });
    });
}

function getTextFromHTMLElement(element) {
    let textContent = "";
    if (element.childNodes) {
        textContent = Array.from(element.childNodes) // Get all child nodes of the body
          .filter(node => node.nodeType === Node.TEXT_NODE || // Keep text nodes
                          (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== 'script' && node.tagName.toLowerCase() !== 'style')) // Keep elements that are not 'script' or 'style'
          .map(node => node.nodeType === Node.TEXT_NODE ? node.nodeValue : node.innerText) // Use nodeValue for text nodes, innerText for others
          .join(' '); // Join all text contents with a space

        // return Array.from(element.childNodes) // Get all child nodes of the body
        //   .filter(node => node.nodeType === Node.TEXT_NODE)
        //   .map(node => node.textContent)
        //   .join(' '); // Join all text contents with a space
    } else {
        textContent = element.innerText;
    }

    return textContent.replace(/\s+/g, ' ').trim();
}
