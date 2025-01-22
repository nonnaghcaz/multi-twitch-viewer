chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "getTwitchResponse") {
            var channel = request.channel;
            var maxTries = request.maxTries || 3;
            var retryDelay = request.retryDelay || 100;

            function fetchWithRetry(triesLeft) {
                fetch(`https://twitch.tv/${channel}`)
                    .then(response => response.text())
                    .then(text => {
                        sendResponse({text: text});
                    }).catch(error => {
                        if (triesLeft > 1) {
                            setTimeout(() => fetchWithRetry(triesLeft - 1), retryDelay);
                        } else {
                            console.error(`Error fetching channel ${channel}: ${error}`);
                            sendResponse({text: null});
                        }
                    });
            }

            fetchWithRetry(maxTries);
            return true;
        }
    }
);
