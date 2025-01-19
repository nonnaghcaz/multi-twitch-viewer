async function getChannelsFromTabUrl() {
    const url = await getTabUrl();
    const urlObj = new URL(url);
    var channels = urlObj.pathname.split("/").filter((part) => part.length > 0);
    return channels;
}

async function getTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0) {
                resolve(tabs[0].url);
            } else {
                reject(new Error("Failed to get tab URL"));
            }
        });
    });
}

async function isOnMultiStreamPage() {
    const url = await getTabUrl();
    return url.startsWith("https://multistre.am/");
}

async function isOnTwitchPage() {
    const url = await getTabUrl();
    return url.startsWith("https://www.twitch.tv/");
}

async function isWatchingChannel(channel) {
    channel = channel.trim().toLowerCase();
    if (channel.length === 0) {
        return;
    }
    const isOnMultiStreamPageResult = await isOnMultiStreamPage();
    if (!isOnMultiStreamPageResult) {
        return false;
    }
    const channels = await getChannelsFromTabUrl();
    return channels.includes(channel);
}

async function watchChannels(channels) {
    var url = `https://multistre.am/${channels.join("/")}`;
    const currentUrl = await getTabUrl();
    if (currentUrl.startsWith("https://multistre.am/")) {
        chrome.tabs.update({ url: url });
    } else {
        chrome.tabs.create({ url: url });
    }
}

export { getChannelsFromTabUrl, getTabUrl, isOnMultiStreamPage, isOnTwitchPage, isWatchingChannel, watchChannels };

