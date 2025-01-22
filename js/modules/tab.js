async function getChannelsFromTabUrl() {
    const url = await getTabUrl();
    const urlObj = new URL(url);
    var channels = urlObj.pathname.split("/").filter((part) => part.length > 0);
    return channels;
}

async function getTabUrl(maxTries=3, retryDelay=100) {
    for (let i = 0; i < maxTries; i++) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                return tab.url;
            }
        } catch (error) {
            console.error(`Attempt ${i + 1} failed: ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    throw new Error('Failed to get tab URL after maximum retries');
}


async function isOnMultiStreamPage() {
    const url = await getTabUrl();
    if (!url) {
        return false;
    }
    return url.startsWith("https://multistre.am/");
}

async function isOnTwitchPage() {
    const url = await getTabUrl();
    if (!url) {
        return false;
    }
    return url.startsWith("https://www.twitch.tv/");
}

async function isWatchingChannel(channel) {
    channel = channel.trim().toLowerCase();
    if (channel.length === 0) {
        return;
    }
    const isOnMultiStreamPageResult = await isOnMultiStreamPage();
    const isOnTwitchPageResult = await isOnTwitchPage();
    if (!(isOnMultiStreamPageResult || isOnTwitchPageResult)) {
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

