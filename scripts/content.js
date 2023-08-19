// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "changeWidth") {
        applyWidthChange(message.value);
        sendResponse({status: "success"}); 
    }
});

// Function to apply the width change and print to the console
function applyWidthChange(value) {
    let newWidth = value + 'rem';
    let selectors = [
        '.flex.p-4.gap-4.text-base.md\\:gap-6.md\\:max-w-2xl.lg\\:max-w-\\[38rem\\].xl\\:max-w-3xl.md\\:py-6.lg\\:px-0.m-auto',
        '.flex.p-4.gap-4.text-base.md\\:gap-6.md\\:max-w-3xl.md\\:py-6.lg\\:px-0.m-auto'
    ];

    selectors.forEach(selector => {
        let targetElements = document.querySelectorAll(selector);
        targetElements.forEach(element => {
            element.style.maxWidth = newWidth;
        });
    });

    console.log(`Applied max-width change: ${newWidth}`);
}

// Start observing for changes
observeDOMChanges();

function observeDOMChanges() {
    // Target the body element
    let targetNode = document.body;

    // Options for the observer (which mutations to observe)
    let config = { attributes: false, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    let callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if the target element is present now
                let selectors = [
                    '.flex.p-4.gap-4.text-base.md\\:gap-6.md\\:max-w-2xl.lg\\:max-w-\\[38rem\\].xl\\:max-w-3xl.md\\:py-6.lg\\:px-0.m-auto',
                    '.flex.p-4.gap-4.text-base.md\\:gap-6.md\\:max-w-3xl.md\\:py-6.lg\\:px-0.m-auto'
                ];
                
                for (const selector of selectors) {
                    let targetElements = document.querySelectorAll(selector);
                    if (targetElements.length > 0) {
                        chrome.storage.local.get('widthValue', function(data) {
                            if (data.widthValue) {
                                applyWidthChange(data.widthValue);
                            }
                        });
                        // Since we've found the element and applied the change, we can disconnect the observer
                        observer.disconnect();
                        break;
                    }
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    let observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}
