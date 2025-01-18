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

export { addChannelsToStorage, getStoredChannels, isChannelLive, removeChannelsFromStorage };

