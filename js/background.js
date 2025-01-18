

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "checkIfLive") {
            var channel = request.channel;
            fetch(`https://twitch.tv/${channel}`)
                .then(response => response.text())
                .then(text => {
                    var isLive = text.includes("isLiveBroadcast");
                    var _text = isLive ? "is" : "is not";
                    sendResponse({isLive: isLive});
                }).catch(error => {
                    console.error(`Error fetching channel ${channel}: ${error}`);
                    sendResponse({isLive: null});
                });
            return true;
        }
    }
);
