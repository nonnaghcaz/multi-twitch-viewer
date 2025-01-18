
import { addChannelsToStorage, removeChannelsFromStorage } from "./modules/channel.js";
import { CHANNEL_ADD_BUTTON_ID, CHANNEL_INPUT_ID, DELETE_BUTTON_ID, INPUT_ERROR_ID, SUBMIT_BUTTON_ID } from "./modules/constants.js";
import { watchChannels } from "./modules/tab.js";
import { clearTable, drawTable, getSelectedChannels, initTable } from "./modules/table.js";


document.addEventListener("DOMContentLoaded", function() {
    _onReady();
});

async function _handleDeleteSelectedChannels(e) {
    var selectedChannels = getSelectedChannels();
    if (selectedChannels.length > 0) {
        removeChannelsFromStorage(selectedChannels).then(() => {
            clearTable();
            drawTable();
        });
    }
}

function _handleAddChannels(e) {
    const inputElem = document.getElementById(CHANNEL_INPUT_ID);
    const inputError = document.getElementById(INPUT_ERROR_ID);
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
        clearTable();
        drawTable();
    });
}

function _handleWatchChannels(e) {
    var selectedChannels = getSelectedChannels();
    if (selectedChannels.length > 0) {
        watchChannels(selectedChannels);
    }
}

function _onReady() {
    const addChannelButton = document.getElementById(CHANNEL_ADD_BUTTON_ID);
    const submitButton = document.getElementById(SUBMIT_BUTTON_ID);
    const inputError = document.getElementById(INPUT_ERROR_ID);
    const channelInput = document.getElementById(CHANNEL_INPUT_ID);
    const deleteButton = document.getElementById(DELETE_BUTTON_ID);

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

    initTable();
}







