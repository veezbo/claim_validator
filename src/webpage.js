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

            const text = getTextFromHTMLElement(doc.body);
            console.log(text);
            resolve(text);

            // Perhaps in the future we will make use of this hash to find more targeted information on the page
            // For now, it doesn't make sense to do it because even when we have the hash, comments still tend to reference the entire page
            // } else {
            //     // Find the element by its ID using the hash
            //     const element = doc.getElementById(hash);
            //     if (element) {
            //         // Use the innerText or textContent property to get the text content of the element
            //         const text = getTextFromHTMLElement(element);
            //         console.log(text);
            //         resolve(text);
            //     } else {
            //         console.log('Expected element not found');
            //         reject('Element not found');
            //     }
            // }
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

// function getTextFromHTMLElement(element) {
//     // Check if the element itself is a heading. If so, start collecting from the next sibling.
//     const isHeading = /^H[1-6]$/i.test(element.tagName);
//     let textContent = element.innerText || '';
//     let nextElement = isHeading ? element.nextElementSibling : null;
//
//     // Define the hierarchy of headings for reference
//     const headingLevels = { 'H1': 1, 'H2': 2, 'H3': 3, 'H4': 4, 'H5': 5, 'H6': 6 };
//
//     // Find the level of the heading if it is a heading
//     const elementLevel = headingLevels[element.tagName] || 0;
//
//     // If it's a heading, collect text from the next siblings
//     if (isHeading) {
//         while (nextElement) {
//             // Include text if the element is not a script or style tag
//             if (nextElement.tagName.toLowerCase() !== 'script' && nextElement.tagName.toLowerCase() !== 'style') {
//                 // Check if the sibling is a heading of the same or higher level
//                 if (headingLevels[nextElement.tagName] && headingLevels[nextElement.tagName] <= elementLevel) {
//                     break; // Break out of the loop if a heading of the same or higher level is found
//                 }
//                 textContent += ' ' + (nextElement.innerText || '');
//             }
//             nextElement = nextElement.nextElementSibling;
//         }
//     }
//
//     return textContent.replace(/\s+/g, ' ').trim();
// }
