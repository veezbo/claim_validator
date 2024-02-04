// Function to process the comment, extracting both text and hyperlinks
import {CLAIM_REGEX, URL_REGEX} from "./regex";
import {extractText} from "./webpage";
import {
    getClaimExtractionPrompt,
    getClaimVerificationPrompt,
    getClaimVerificationReport,
    getExtractedClaims
} from "./prompt";

function processComment(element) {

    let result = '';
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Append the text node content
            result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
            if (node.textContent === node.href) {
                // Append the url text only
                result += node.textContent;
            } else {
                // Append text representation of the hyperlink
                result += `[${node.textContent}](${node.href})`;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively process other element nodes
            result += processComment(node);
        }
    }

    // Return the processed comment
    return result.trim();
}

function findCommentTaglines(document, callback) {
    // Get all the elements with the class 'tagline'
    const taglines = document.getElementsByClassName('tagline');

    // Iterate through each 'tagline' element
    Array.from(taglines).forEach(function(tagline) {
        // console.log(tagline);

        // Find the closest parent '.entry' element which contains both the tagline and the comment
        const entryElement = tagline.closest('.entry');
        if (entryElement) {
            // console.log(entryElement);

            // Find the '.md' element which contains the comment text
            const commentTextContainer = entryElement.querySelector('.md');

            if (commentTextContainer) {
                const commentText = processComment(commentTextContainer);

                // Only create buttons on comments that contain URLs
                if (URL_REGEX.test(commentText)) {
                    callback(tagline, commentText);
                }
            }
        }
    });
}

// Function to walk through the DOM and find text nodes
function findTextNodes(document, callback) {

    // Selector for Reddit comments - this would need to be updated if Reddit changes their layout
    const commentSelector = '.commentarea .md';

    // Get all comment elements
    const commentElements = document.querySelectorAll(commentSelector);

    // // Use a Set to ensure uniqueness
    // const uniqueCommentElements = new Set();

    // Iterate over each comment element
    commentElements.forEach((element) => {
        // Process the comment to include text content and hyperlinks
        const commentText = processComment(element);

        if (CLAIM_REGEX.test(commentText)) {
          console.log(commentText);

          callback(element, commentText);
          // // Add the comment element to the set of unique comments
          // uniqueCommentElements.add(element);
        }
    });

}



function onButtonClick(event) {
    // Disable the button to prevent further clicks
    event.target.disabled = true;

    let reportDiv = document.createElement('div');
    reportDiv.className = 'claim-report';

    const commentText = event.target.dataset.commentText;

    const urlMatch = commentText.match(URL_REGEX);
    console.log(urlMatch);
    if (urlMatch) {
        extractText(urlMatch[0])
            .then(sourceText => {

                // Placeholder for now just to see if it works
                const claimExtractorPrompt = getClaimExtractionPrompt(commentText);
                console.log("ClaimExtractorPrompt: " + claimExtractorPrompt);
                getExtractedClaims(claimExtractorPrompt)
                    .then(claims => {
                        console.log("Claims: " + claims);

                        // Construct the prompt text to receive the claims
                        const prompt = getClaimVerificationPrompt(claims, sourceText);
                        console.log("Claim Verification Prompt: " + prompt);

                        getClaimVerificationReport(prompt)
                            .then(report => {
                                // TODO: Split this up with <br> to support multiple lines and prettier output
                                reportDiv.textContent = report;
                                event.target.parentNode.insertBefore(reportDiv, event.target.nextSibling);
                            })
                            .catch(error => {
                                console.error(error);
                                reportDiv.textContent = `Error retrieving source: <<${error.message}>>`;
                                event.target.parentNode.insertBefore(reportDiv, event.target.nextSibling);
                            });

                    })
                    .catch(error => {
                        console.error(error);
                    });

            })
            .catch(error => {
                console.error(error);
                reportDiv.textContent = `Error extracting webpage from url: <<${error.message}>>`;
                event.target.parentNode.insertBefore(reportDiv, event.target.nextSibling);
            })
    } else {
        reportDiv.textContent = 'No url found. This should not happen';
        event.target.parentNode.insertBefore(reportDiv, event.target.nextSibling);
    }

}

// Function to insert button near the comment header
function insertButtonCommentTaglineOldReddit(tagline, commentText) {
    // Find the 'time' element within the tagline
    const timeElement = tagline.querySelector('time');

    // Only proceed if a 'time' element is found
    if (timeElement) {
        // Create a new button
        let button = document.createElement('button');
        button.textContent = 'Validate Claim';
        button.type = 'button';  // Prevent form submission i.e. page reload
        button.dataset.commentText = commentText;
        button.addEventListener('click', onButtonClick);

        // Insert the button after the 'time' element
        timeElement.parentNode.insertBefore(button, timeElement.nextSibling);
    }
}

// Function to insert button after a text node
function insertButtonAfterTextNode(textNode, commentText) {
    // Create a button element
    let button = document.createElement('button');
    button.textContent = 'Validate Claim';
    button.type = 'button';  // Prevent form submission i.e. page reload
    button.dataset.commentText = commentText;
    button.addEventListener('click', onButtonClick);

    textNode.appendChild(button);

    // // Create a container for the text node and button
    // let container = document.createElement('span');
    //
    // // Move the text node into the container
    // container.appendChild(textNode.cloneNode());
    //
    // // Insert the button into the container
    // container.appendChild(button);
    //
    // // Replace the original text node with the container
    // textNode.parentNode.replaceChild(container, textNode);
}

// Call the findTextNodes function on the document body
// findTextNodes(document.body, insertButtonAfterTextNode);

findCommentTaglines(document.body, insertButtonCommentTaglineOldReddit);

// Check if the document is already fully loaded
// if (document.readyState === 'loading') {
//     console.log("document.readyState === 'loading'");
//     // If the document is still loading, add an event listener for DOMContentLoaded
//     document.addEventListener('DOMContentLoaded', function() {
//         // Call the findCommentTaglines function on the document body
//         console.log("DOMContentLoaded");
//         findCommentTaglines(document.body, insertButtonCommentTaglineOldReddit);
//     });
// } else {
//     console.log("document.readyState !== 'loading'");
//     // If it's already loaded, run the function immediately
//     findCommentTaglines(document.body, insertButtonCommentTaglineOldReddit);
// }

// document.addEventListener('DOMContentLoaded', function() {
//     // Call the findCommentTaglines function on the document body
//     console.log("DOMContentLoaded");
//     findCommentTaglines(document.body, insertButtonCommentTaglineOldReddit);
// });
