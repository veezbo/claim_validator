// Function to process the comment, extracting both text and hyperlinks
import {URL_REGEX} from "./regex";
import {extractText} from "./webpage";
import {getClaimsValidationReport} from "./report";

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
                getClaimsValidationReport(commentText, sourceText)
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

findCommentTaglines(document.body, insertButtonCommentTaglineOldReddit);
