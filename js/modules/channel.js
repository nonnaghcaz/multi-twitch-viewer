import { STORAGE_CHANNELS_KEY } from "./constants.js";
import { getElementByXpath } from "./dom.js";
import { readLocalStorage, writeLocalStorage } from "./storage.js";
import { isWatchingChannel } from "./tab.js";



async function getChannelData(channel, maxTries=3, retryDelay=100) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay);
    const doc = new DOMParser().parseFromString(text, "text/html");
    const isWatching = await isWatchingChannel(channel);
    const isLive = _isLive(doc);
    var data = { channel, isLive, isWatching, streamTitle: null };
    if (isLive) {
        const streamTitle = _getStreamTitleFromResponse(doc);
        if (!streamTitle) {
            console.error("Failed to get stream title from text", doc);
        }
        data.streamTitle = streamTitle;
    }

    return data;
}

async function getTwitchResponse(channel, maxTries=3, retryDelay=100) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({contentScriptQuery: "getTwitchResponse", channel: channel, maxTries: maxTries, retryDelay: retryDelay}, function(response) {
            if (response) {
                resolve(response.text);
            } else {
                reject(new Error("Failed to get Twitch response"));
            }
        });
    });
}

async function getStreamTitle(channel, maxTries=3, retryDelay=100) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay);
    return _getStreamTitleFromResponse(text);
}



async function isChannelLive(channel, maxTries=3, retryDelay=100) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay);
    return _isLive(text);
}


async function getStoredChannels() {
    return await readLocalStorage(STORAGE_CHANNELS_KEY);
}

async function addChannelToStorage(channel) {
    var channels = await getStoredChannels();
    if (!channels.includes(channel)) {
        channels.push(channel);
        await writeLocalStorage(STORAGE_CHANNELS_KEY, channels);
        return true;
    }
    return false;
}

async function removeChannelFromStorage(channel) {
    var channels = await getStoredChannels();
    if (channels.includes(channel)) {
        channels = channels.filter((c) => c !== channel);
        await writeLocalStorage(STORAGE_CHANNELS_KEY, channels);
        return true;
    }
    return false;
}

async function addChannelsToStorage(channels) {
    var storedChannels = await getStoredChannels();
    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        if (!storedChannels.includes(channel)) {
            storedChannels.push(channel);
        }
    }
    await writeLocalStorage(STORAGE_CHANNELS_KEY, storedChannels);
}

async function removeChannelsFromStorage(channels) {
    var storedChannels = await getStoredChannels();
    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        storedChannels = storedChannels.filter((c) => c !== channel);
    }
    await writeLocalStorage(STORAGE_CHANNELS_KEY, storedChannels);
}

function _getStreamTitleFromResponse(doc) {
    // Parse the meta:description tag from the response
    const xpath = "//meta[contains(@name, 'description')]";
    const metaDescription = getElementByXpath(xpath, doc);
    return metaDescription ? metaDescription.getAttribute("content") : null;
}

function _isLive(doc) {
    var text = doc.head.innerHTML;
    return text.includes("isLiveBroadcast");
}

export { addChannelsToStorage, addChannelToStorage, getChannelData, getStoredChannels, getStreamTitle, isChannelLive, removeChannelFromStorage, removeChannelsFromStorage };

