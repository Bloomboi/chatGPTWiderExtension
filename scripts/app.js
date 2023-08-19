document.addEventListener('DOMContentLoaded', function() {
    let slider = document.getElementById('wideAmountSlider');
    let sliderValueDisplay = document.createElement('span');
    sliderValueDisplay.id = "sliderValueDisplay";
    slider.insertAdjacentElement('afterend', sliderValueDisplay);

    function sendMessageToContentScript(value) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let currentTab = tabs[0];

            // Only send a message if on https://chat.openai.com/
            if (currentTab.url.includes("https://chat.openai.com/")) {
                try {
                    chrome.tabs.sendMessage(currentTab.id, {action: "changeWidth", value: value}, function(response) {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError.message);
                        } else {
                            console.log('Response:', response);
                        }
                    });
                    console.log('Sending value:', value);
                } catch (error) {
                    console.error("Failed to send the message:", error);
                }
            }
        });
    }

    // Fetch and set the saved slider value upon loading the popup
    chrome.storage.local.get('widthValue', function(data) {
        if (data.widthValue) {
            slider.value = data.widthValue;
            sliderValueDisplay.textContent = data.widthValue;
            sendMessageToContentScript(data.widthValue); // Send the value to the content script when popup is loaded
        } else {
            sliderValueDisplay.textContent = slider.value;
            sendMessageToContentScript(slider.value);
        }
    });

    slider.addEventListener('input', function() {
        let newWidthValue = slider.value;
        sliderValueDisplay.textContent = newWidthValue;

        // Store the value in local storage
        chrome.storage.local.set({ 'widthValue': newWidthValue });

        // Send the new value to the content script
        sendMessageToContentScript(newWidthValue);
    });
});
