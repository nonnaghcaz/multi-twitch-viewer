import { CHANNEL_AUTHOR_PICKS, STORAGE_CHANNELS_KEY, TWITCH_DEFAULT_MAX_TRIES, TWITCH_DEFAULT_RETRY_DELAY, TWITCH_STREAM_ISLIVE_TEXT, TWITCH_STREAM_ISLIVE_XPATH, TWITCH_STREAM_TITLE_ATTRIBUTE, TWITCH_STREAM_TITLE_XPATH } from "./constants.js";
import { getElementByXpath } from "./dom.js";
import { readLocalStorage, writeLocalStorage } from "./storage.js";
import { isWatchingChannel } from "./tab.js";

// -------------------------------------------------------------------------------------
// Twitch DOM parsing functions
// -------------------------------------------------------------------------------------

async function getTwitchResponse(channel, maxTries=TWITCH_DEFAULT_MAX_TRIES, retryDelay=TWITCH_DEFAULT_RETRY_DELAY, tryUntilLive=false) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({contentScriptQuery: "getTwitchResponse", channel: channel, maxTries: maxTries, retryDelay: retryDelay, tryUntilLive: tryUntilLive}, function(response) {
            if (response) {
                resolve(response.text);
            } else {
                reject(new Error("Failed to get Twitch response"));
            }
        });
    });
}

async function getChannelData(channel, maxTries=TWITCH_DEFAULT_MAX_TRIES, retryDelay=TWITCH_DEFAULT_RETRY_DELAY, tryUntilLive=false) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay, tryUntilLive);
    const doc = new DOMParser().parseFromString(text, "text/html");
    const isWatching = await isWatchingChannel(channel);
    const isLive = _isChannelLiveFromResponse(doc);
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

async function getStreamTitle(channel, maxTries=TWITCH_DEFAULT_MAX_TRIES, retryDelay=TWITCH_DEFAULT_RETRY_DELAY, tryUntilLive=false) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay, tryUntilLive);
    const doc = new DOMParser().parseFromString(text, "text/html");
    return _getStreamTitleFromResponse(doc);
}

function _getStreamTitleFromResponse(doc) {
    // Parse the meta:description tag from the response
    const element = getElementByXpath(TWITCH_STREAM_TITLE_XPATH, doc);
    return element ? element.getAttribute(TWITCH_STREAM_TITLE_ATTRIBUTE) : null;
}

async function isChannelLive(channel, maxTries=TWITCH_DEFAULT_MAX_TRIES, retryDelay=TWITCH_DEFAULT_RETRY_DELAY, tryUntilLive=false) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay, tryUntilLive);
    const doc = new DOMParser().parseFromString(text, "text/html");
    return _isChannelLiveFromResponse(doc);
}

function _isChannelLiveFromResponse(doc) {
    const element = getElementByXpath(TWITCH_STREAM_ISLIVE_XPATH, doc);
    return element && element.textContent.includes(TWITCH_STREAM_ISLIVE_TEXT);
}

// -------------------------------------------------------------------------------------
// Storage functions
// -------------------------------------------------------------------------------------

async function addAuthorChannelsToStorage() {
    var channels = CHANNEL_AUTHOR_PICKS;
    addChannelsToStorage(channels);
}

async function getStoredChannels() {
    return await readLocalStorage(STORAGE_CHANNELS_KEY);
}

async function addChannelToStorage(channel) {
    return await addChannelsToStorage([channel]);
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

async function removeChannelFromStorage(channel) {
    return await removeChannelsFromStorage([channel]);
}

async function removeChannelsFromStorage(channels) {
    var storedChannels = await getStoredChannels();
    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        storedChannels = storedChannels.filter((c) => c !== channel);
    }
    await writeLocalStorage(STORAGE_CHANNELS_KEY, storedChannels);
}


export { addAuthorChannelsToStorage, addChannelsToStorage, addChannelToStorage, getChannelData, getStoredChannels, getStreamTitle, isChannelLive, removeChannelFromStorage, removeChannelsFromStorage };

