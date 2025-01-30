import { CHANNEL_AUTHOR_PICKS, STORAGE_CHANNELS_KEY, TWITCH_DEFAULT_MAX_TRIES, TWITCH_DEFAULT_RETRY_DELAY } from "./constants.js";
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


function sortChannelDatas(a, b) {
    var isLiveA = a.isLive ? 1 : 0;
    var isLiveB = b.isLive ? 1 : 0;
    var isLive = isLiveA - isLiveB;
    var isWatchingA = a.isWatching ? 1 : 0;
    var isWatchingB = b.isWatching ? 1 : 0;
    var isWatching = isWatchingA - isWatchingB;
    var channelA = a.channel.toLowerCase();
    var channelB = b.channel.toLowerCase();
     if (isLiveA === isLiveB) {
        if (isWatchingA === isWatchingB) {
            return channelA.localeCompare(channelB);
        } else if (isWatchingA > isWatchingB) {
            return -1;
        } else {
            return 1;
        }
    } else if (isLiveA > isLiveB) {
        return -1;
    } else {
        return 1;
    }
}

function reindexChannelDatas(channelDatas) {
    var index = 0;
    channelDatas.forEach((data) => {
        data.index = index++;
    });
    return channelDatas;
}

async function getChannelData(channel, maxTries=TWITCH_DEFAULT_MAX_TRIES, retryDelay=TWITCH_DEFAULT_RETRY_DELAY, tryUntilLive=false) {
    const text = await getTwitchResponse(channel, maxTries, retryDelay, tryUntilLive);
    var doc = new DOMParser().parseFromString(text, "text/html");
    var isWatching = await isWatchingChannel(channel);
    var data = _parseChannelDataFromResponse(doc);
    if (!data) {
        data = {}
    }
    if (!data.channel) {
        data.channel = channel;
    }
    data.isWatching = isWatching;
    data.raw = text;

    return data;
}

async function getChannelDatas(channels, maxTries=TWITCH_DEFAULT_MAX_TRIES, retryDelay=TWITCH_DEFAULT_RETRY_DELAY, tryUntilLive=false, sort=true, reindex=true) {
    var promises = channels.map((channel) => getChannelData(channel, maxTries, retryDelay, tryUntilLive));
    var channelDatas = await Promise.all(promises);
    if (sort) {
        channelDatas.sort(sortChannelDatas);
    }
    if (reindex) {
        channelDatas = reindexChannelDatas(channelDatas);
    }
    return channelDatas;
}

function parseTwitchResponse(text) {
    var doc = new DOMParser().parseFromString(text, "text/html");
    return _parseChannelDataFromResponse(doc);
}

function _parseChannelDataFromResponse(doc) {
    /*
        {
        "@context": "http://schema.org",
        "@graph": [
            {
            "@type": "VideoObject",
            "description": "LEO ESCOBAR | NOPIXEL",
            "embedUrl": "https://player.twitch.tv/?channel=imbladee_\u0026player=facebook\u0026autoplay=true\u0026parent=meta.tag",
            "name": "ImBladee_ - Twitch",
            "thumbnailUrl": [
                "https://static-cdn.jtvnw.net/previews-ttv/live_user_imbladee_-80x45.jpg",
                "https://static-cdn.jtvnw.net/previews-ttv/live_user_imbladee_-320x180.jpg",
                "https://static-cdn.jtvnw.net/previews-ttv/live_user_imbladee_-640x360.jpg"
            ],
            "uploadDate": "2025-01-29T21:40:38Z",
            "publication": {
                "@type": "BroadcastEvent",
                "endDate": "2025-01-30T02:19:28Z",
                "startDate": "2025-01-29T21:40:38Z",
                "isLiveBroadcast": true
            }
            }
        ]
        }
    */

    var script = getElementByXpath("//script[@type='application/ld+json']", doc);

    try {
        var json = JSON.parse(script.textContent);
    } catch (error) {
        return null;
    }

    var isLive = json["@graph"][0].publication.isLiveBroadcast;
    var streamTitle = json["@graph"][0].description;
    var uploadDate = json["@graph"][0].uploadDate;
    var channel = json["@graph"][0].name.split(" - Twitch")[0];

    var data = { channel, isLive, streamTitle, uploadDate, raw: json };
    if (isLive && !streamTitle) {
        console.error("Failed to get stream title from text", doc);
    }

    return data;
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


export { addAuthorChannelsToStorage, addChannelsToStorage, addChannelToStorage, getChannelData, getChannelDatas, getStoredChannels, getTwitchResponse, parseTwitchResponse, removeChannelFromStorage, removeChannelsFromStorage, sortChannelDatas };

