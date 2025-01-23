import { addChannelsToStorage, removeChannelsFromStorage } from "./modules/channel.js";
import { STORAGE_CHANNELS_KEY } from "./modules/constants.js";
import { readLocalStorage, writeLocalStorage } from "./modules/storage.js";

document.addEventListener("DOMContentLoaded", _onReady);

function _onReady() {
    var saveButton = document.getElementById("save-channel-changes");
    var deleteButton = document.getElementById("delete-selected-channels");
    var cancelButton = document.getElementById("cancel-channel-edits");
    var addButton = document.getElementById("add-channel-button");

    _createChannelsList();
    saveButton.addEventListener("click", _handleSaveChannels);
    deleteButton.addEventListener("click", _handleDeleteChannels);
    cancelButton.addEventListener("click", _handleCancelEdits);
    addButton.addEventListener("click", _handleAddChannels);
}

function _createChannelsList() {
    _hideEditButtons();
    var channelsContainer = document.getElementById("channels-container");
    channelsContainer.innerHTML = "";
    readLocalStorage(STORAGE_CHANNELS_KEY).then((channels) => {
        channels.forEach((channel) => {
            var channelDiv = document.createElement("div");
            channelDiv.classList.add("input-group");
            channelDiv.dataset.channel = channel;

            var checkboxWrapper = document.createElement("div");
            checkboxWrapper.classList.add("input-group-text");
            var channelCheckbox = document.createElement("input");
            channelCheckbox.type = "checkbox";
            channelCheckbox.classList.add("form-check-input");
            channelCheckbox.addEventListener("change", _updateButtonVisibilities);

            var channelTextInput = document.createElement("input");
            channelTextInput.type = "text";
            channelTextInput.value = channel;
            channelTextInput.classList.add("form-control");
            channelTextInput.addEventListener("input", _updateButtonVisibilities);
            checkboxWrapper.appendChild(channelCheckbox);
            channelDiv.appendChild(checkboxWrapper);
            channelDiv.appendChild(channelTextInput);
            channelsContainer.appendChild(channelDiv);
        });
    });
}

function _hideEditButtons() {
    var saveButton = document.getElementById("save-channel-changes");
    var deleteButton = document.getElementById("delete-selected-channels");
    var cancelButton = document.getElementById("cancel-channel-edits");

    saveButton.style.display = "none";
    deleteButton.style.display = "none";
    cancelButton.style.display = "none";
}

function _handleCancelEdits(e) {
    _createChannelsList();
}

function _hasChannelEdits() {
    var channelsContainer = document.getElementById("channels-container");
    var hasChanges = false;
    channelsContainer.childNodes.forEach((channelDiv) => {
        var channelTextInput = channelDiv.childNodes[1];
        var newChannel = channelTextInput.value;
        var oldChannel = channelDiv.dataset.channel;
        if (newChannel !== oldChannel) {
            hasChanges = true;
        }
    });
    return hasChanges;
}

function _hasSelectedChannels() {
    var channelsContainer = document.getElementById("channels-container");
    var hasChecked = false;
    channelsContainer.childNodes.forEach((channelDiv) => {
        var channelCheckbox = channelDiv.childNodes[0].childNodes[0];
        if (channelCheckbox.checked) {
            hasChecked = true;
        }
    });
    return hasChecked;
}

function _hasAnyEdits() {
    return _hasChannelEdits() || _hasSelectedChannels();
}

function _updateButtonVisibilities(e) {
    var saveButton = document.getElementById("save-channel-changes");
    var deleteButton = document.getElementById("delete-selected-channels");
    var cancelButton = document.getElementById("cancel-channel-edits");

    var hasChanges = _hasChannelEdits();
    var hasChecked = _hasSelectedChannels();

    saveButton.style.display = hasChanges ? "block" : "none";
    deleteButton.style.display = hasChecked ? "block" : "none";
    cancelButton.style.display = hasChanges || hasChecked ? "block" : "none";
}


function _handleDeleteChannel(e) {
    var channel = e.target.dataset.channel;
    removeChannelsFromStorage([channel]).then(() => {
        _createChannelsList();
    });
}

function _getCheckedChannels() {
    var channelsContainer = document.getElementById("channels-container");
    var checkedChannels = [];
    channelsContainer.childNodes.forEach((channelDiv) => {
        var channelCheckbox = channelDiv.childNodes[0].childNodes[0];
        if (channelCheckbox.checked) {
            checkedChannels.push(channelDiv.dataset.channel);
        }
    });
    return checkedChannels;
}


function _handleAddChannels(e) {
    const inputElem = document.getElementById("add-channel-input");
    const inputError = document.getElementById("add-channel-error");
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
        _createChannelsList();
    });
}

function _handleSaveChannels(e) {
    var channelsContainer = document.getElementById("channels-container");
    var channels = [];
    channelsContainer.childNodes.forEach((channelDiv) => {
        var channelTextInput = channelDiv.childNodes[1];
        var newChannel = channelTextInput.value;
        var oldChannel = channelDiv.dataset.channel;
        if (newChannel !== oldChannel) {
            console.log(`Renaming ${oldChannel} to ${newChannel}`);
        }
        channels.push(newChannel);
    });
    writeLocalStorage(STORAGE_CHANNELS_KEY, channels).then(() => {
        _createChannelsList();
    });
}

function _handleDeleteChannels(e) {
    var checkedChannels = _getCheckedChannels();
    removeChannelsFromStorage(checkedChannels).then(() => {
        _createChannelsList();
    });
}