
import { addChannelsToStorage, removeChannelsFromStorage } from "./modules/channel.js";
import { POPUP_CHANNEL_ADD_BUTTON_ID, POPUP_CHANNEL_INPUT_ID, POPUP_CHANNEL_TABLE_ID, POPUP_INPUT_ERROR_ID, POPUP_SUBMIT_BUTTON_ID, STORAGE_CHANNELS_KEY, TABLE_DELETE_BUTTON_ID } from "./modules/constants.js";
import { valueInLocalStorage } from "./modules/storage.js";
import { getChannelsFromTabUrl, isOnTwitchPage, watchChannels } from "./modules/tab.js";
import { clearTable, drawTable, getSelectedChannels, initTable } from "./modules/table.js";

const SELECTOR = `#${POPUP_CHANNEL_TABLE_ID}`;

document.addEventListener("DOMContentLoaded", function() {
    _onReady();
});

async function _handleDeleteSelectedChannels(e) {
    var selectedChannels = getSelectedChannels();
    if (selectedChannels.length > 0) {
        removeChannelsFromStorage(selectedChannels).then(() => {
            clearTable(SELECTOR);
            drawTable(SELECTOR);
        });
    }
}

function _handleAddChannels(e) {
    const inputElem = document.getElementById(POPUP_CHANNEL_INPUT_ID);
    const inputError = document.getElementById(POPUP_INPUT_ERROR_ID);
    var inputValue = inputElem.value.trim().toLowerCase();
    inputElem.value = "";
    if (inputValue.length === 0) {
        inputError.innerText = "Please enter a channel name";
        inputError.style.display = "block";
        return;
    }
    inputError.style.display = "none";

    var inputSplit = inputValue.split(",").map((value) => value.trim());
    var channels = []
    for (var i = 0; i < inputSplit.length; i++) {
        var channel = inputSplit[i];
        if (!channel.length || channels.includes(channel)) {
            continue
        }

        if (channel.endsWith("/")) {
            channel = channel.slice(0, -1);
        }
        if (channel.includes("/")) {
            channel = channel.split("/").pop();
        }
        channels.push(channel);

    }
    addChannelsToStorage(channels).then(() => {
        clearTable(SELECTOR);
        drawTable(SELECTOR);
    });
}

function _handleWatchChannels(e) {
    var selectedChannels = getSelectedChannels(SELECTOR);
    if (selectedChannels.length > 0) {
        watchChannels(selectedChannels);
    }
}

function _onReady() {
    const addChannelButton = document.getElementById(POPUP_CHANNEL_ADD_BUTTON_ID);
    const submitButton = document.getElementById(POPUP_SUBMIT_BUTTON_ID);
    const inputError = document.getElementById(POPUP_INPUT_ERROR_ID);
    const channelInput = document.getElementById(POPUP_CHANNEL_INPUT_ID);
    const deleteButton = document.getElementById(TABLE_DELETE_BUTTON_ID);

    submitButton.addEventListener("click", _handleWatchChannels);
    addChannelButton.addEventListener("click", _handleAddChannels);
    channelInput.addEventListener("input", function() {
        inputError.style.display = "none";
    });
    channelInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            _handleAddChannels(e);
        }
    });

    deleteButton.addEventListener("click", _handleDeleteSelectedChannels);

    isOnTwitchPage().then((isOnTwitch) => {
        if (isOnTwitch) {
            getChannelsFromTabUrl().then((channels) => {
                channels.forEach((channel) => {
                    valueInLocalStorage(STORAGE_CHANNELS_KEY, channel).then((isInStorage) => {
                        if (!isInStorage) {
                            _appendChannelInput(channel);
                        }
                    });
                });
            });
        }
    });
    initTable(SELECTOR);
}

function _appendChannelInput(channel) {
    const channelInput = document.getElementById(POPUP_CHANNEL_INPUT_ID);
    var value = channelInput.value;
    if (value.length > 0) {
        value += ", ";
    }
    value += channel;

    channelInput.value = value;
}





