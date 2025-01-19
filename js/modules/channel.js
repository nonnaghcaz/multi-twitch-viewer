import { STORAGE_CHANNELS_KEY } from "./constants.js";
import { readLocalStorage, writeLocalStorage } from "./storage.js";

async function isChannelLive(channel) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({contentScriptQuery: "checkIfLive", channel: channel}, function(response) {
            if (response) {
                resolve(response.isLive);
            } else {
                reject(new Error("Failed to check if channel is live"));
            }
        });
    });
}

async function getStreamTitle(channel) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({contentScriptQuery: "getStreamTitle", channel: channel}, function(response) {
            if (response) {
                resolve(response.streamTitle);
            } else {
                reject(new Error("Failed to get stream title"));
            }
        });
    });
}

async function getStreamTitleWithRetries(channel, maxTries=3, retryDelay=100) {
    if (maxTries < 1) {
        throw new Error("maxTries must be greater than or equal to 1");
    }
    if (retryDelay < 0) {
        throw new Error("retryDelay must be greater than or equal to 0");
    }
    for (let attempt = 1; attempt <= maxTries; attempt++) {
        try {
            const streamTitle = await getStreamTitle(channel);
            if (streamTitle) {
                return streamTitle;
            }
        } catch (error) {
            if (attempt === maxTries) {
                console.error(`Failed to get stream title for ${channel} after ${maxTries} attempts: ${error}`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    return null;
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

export { addChannelsToStorage, addChannelToStorage, getStoredChannels, getStreamTitle, getStreamTitleWithRetries, isChannelLive, removeChannelFromStorage, removeChannelsFromStorage };

