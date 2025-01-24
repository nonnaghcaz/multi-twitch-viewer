import { addChannelsToStorage, removeChannelsFromStorage } from "./modules/channel.js";
import { STORAGE_CHANNELS_KEY, STORAGE_LINKS_KEY } from "./modules/constants.js";
import { readLocalStorage, writeLocalStorage } from "./modules/storage.js";

document.addEventListener("DOMContentLoaded", _onReady);

function _onReady() {
    _initChannels();
    _initLinks();
}

// Channels

function _addAuthorChannels() {
    var channels = ["imbladee_", "ittszach", "spaceboy", "sput", "halfwayhardcore", "mikethebard"];
    addChannelsToStorage(channels).then(() => {
        _createChannelsList();
    });
}

function _addAuthorLinks() {
    var links = [
        { name: "Twitch Directory", url: "https://www.twitch.tv/directory/" },
        { name: "Twitch Following", url: "https://www.twitch.tv/directory/following/" },
        { name: "MultiStre.am", url: "https://multistre.am/" },
        { name: "GitHub Repo", url: "https://github.com/nonnaghcaz/multi-twitch-viewer" }
    ];
    addLinksToStorage(links).then(() => {
        _createLinksList();
    });
}

function _initChannels() {
    var saveChannelEditsButton = document.getElementById("save-channel-changes");
    var deleteSelectedChannelsButton = document.getElementById("delete-selected-channels");
    var cancelChannelEditsButton = document.getElementById("cancel-channel-edits");
    var addChannelButton = document.getElementById("add-channel-button");
    var loadRecommendedChannelsButton = document.getElementById("load-recommended-channels");

    _createChannelsList();
    saveChannelEditsButton.addEventListener("click", _handleSaveChannels);
    deleteSelectedChannelsButton.addEventListener("click", _handleDeleteChannels);
    cancelChannelEditsButton.addEventListener("click", _handleCancelChannelEdits);
    addChannelButton.addEventListener("click", _handleAddChannels);
    loadRecommendedChannelsButton.addEventListener("click", _addAuthorChannels);
    _updateChannelEditButtonVisibilities();
}

function _createChannelsList() {
    _hideChannelEditButtons();
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
            channelCheckbox.addEventListener("change", _updateChannelEditButtonVisibilities);

            var channelTextInput = document.createElement("input");
            channelTextInput.type = "text";
            channelTextInput.value = channel;
            channelTextInput.classList.add("form-control");
            channelTextInput.addEventListener("input", _updateChannelEditButtonVisibilities);
            checkboxWrapper.appendChild(channelCheckbox);
            channelDiv.appendChild(checkboxWrapper);
            channelDiv.appendChild(channelTextInput);
            channelsContainer.appendChild(channelDiv);
        });
    });
}

function _hideChannelEditButtons() {
    var saveButton = document.getElementById("save-channel-changes");
    var deleteButton = document.getElementById("delete-selected-channels");
    var cancelButton = document.getElementById("cancel-channel-edits");

    saveButton.style.display = "none";
    deleteButton.style.display = "none";
    cancelButton.style.display = "none";
}

function _handleCancelChannelEdits(e) {
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

function _updateChannelEditButtonVisibilities(e) {
    var saveButton = document.getElementById("save-channel-changes");
    var deleteButton = document.getElementById("delete-selected-channels");
    var cancelButton = document.getElementById("cancel-channel-edits");

    var hasChanges = _hasChannelEdits();
    var hasChecked = _hasSelectedChannels();

    saveButton.style.display = hasChanges ? "block" : "none";
    deleteButton.style.display = hasChecked ? "block" : "none";
    cancelButton.style.display = hasChanges || hasChecked ? "block" : "none";
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

// Links

function _initLinks() {
    var saveLinkEditsButton = document.getElementById("save-link-changes");
    var deleteSelectedLinksButton = document.getElementById("delete-selected-links");
    var cancelLinkEditsButton = document.getElementById("cancel-link-edits");
    var addLinkButton = document.getElementById("add-link-button");
    var loadRecommendedLinksButton = document.getElementById("load-recommended-links");

    _createLinksList();
    saveLinkEditsButton.addEventListener("click", _handleSaveLinks);
    deleteSelectedLinksButton.addEventListener("click", _handleDeleteLinks);
    cancelLinkEditsButton.addEventListener("click", _handleCancelLinkEdits);
    addLinkButton.addEventListener("click", _handleAddLink);
    loadRecommendedLinksButton.addEventListener("click", _addAuthorLinks);
    _updateLinkButtonVisibilities();
}

function _handleAddLink(e) {
    const nameElem = document.getElementById("add-link-name-input");
    const urlElem = document.getElementById("add-link-url-input");
    const errorElem = document.getElementById("add-link-error");

    var nameValue = nameElem.value.trim();
    var urlValue = urlElem.value.trim();
    nameElem.value = "";
    urlElem.value = "";
    if (nameValue.length === 0) {
        errorElem.innerText = "Please enter a link name";
        errorElem.style.display = "block";
        return;
    }
    if (urlValue.length === 0) {
        errorElem.innerText = "Please enter a link URL";
        errorElem.style.display = "block";
        return;
    }
    errorElem.style.display = "none";
    var links = [];
    links.push({ name: nameValue, url: urlValue });
    addLinksToStorage(links).then(() => {
        _createLinksList();
    });
}

async function addLinksToStorage(links) {
    var storedLinks = await readLocalStorage(STORAGE_LINKS_KEY);
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (!storedLinks.some((storedLink) => storedLink.name === link.name)) {
            storedLinks.push(link);
        }
    }
    await writeLocalStorage(STORAGE_LINKS_KEY, storedLinks);
}

async function removeLinksFromStorage(links) {
    var storedLinks = await readLocalStorage(STORAGE_LINKS_KEY);
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        storedLinks = storedLinks.filter((storedLink) => storedLink.name !== link.name);
    }
    await writeLocalStorage(STORAGE_LINKS_KEY, storedLinks);
}

function _createLinksList() {
    _hideLinkEditButtons();
    var linksContainer = document.getElementById("links-container");
    linksContainer.innerHTML = "";
    readLocalStorage(STORAGE_LINKS_KEY).then((links) => {
        links.forEach((link) => {
            var linkDiv = document.createElement("div");
            linkDiv.classList.add("input-group");
            linkDiv.dataset.link = JSON.stringify(link);

            var checkboxWrapper = document.createElement("div");
            checkboxWrapper.classList.add("input-group-text");
            var linkCheckbox = document.createElement("input");
            linkCheckbox.type = "checkbox";
            linkCheckbox.classList.add("form-check-input");
            linkCheckbox.addEventListener("change", _updateLinkButtonVisibilities);

            var linkTextInput = document.createElement("input");
            linkTextInput.type = "text";
            linkTextInput.value = link.name;
            linkTextInput.classList.add("form-control");
            linkTextInput.addEventListener("input", _updateLinkButtonVisibilities);
            
            var linkUrlInput = document.createElement("input");
            linkUrlInput.type = "text";
            linkUrlInput.value = link.url;
            linkUrlInput.classList.add("form-control");
            linkUrlInput.addEventListener("input", _updateLinkButtonVisibilities);

            checkboxWrapper.appendChild(linkCheckbox);
            linkDiv.appendChild(checkboxWrapper);
            linkDiv.appendChild(linkTextInput);
            linkDiv.appendChild(linkUrlInput);
            linksContainer.appendChild(linkDiv);
        });
    });
}

function _handleDeleteLinks(e) {
    var checkedLinks = _getCheckedLinks();
    removeLinksFromStorage(checkedLinks).then(() => {
        _createLinksList();
    });
}

function _handleSaveLinks(e) {
    var linksContainer = document.getElementById("links-container");
    var links = [];
    linksContainer.childNodes.forEach((linkDiv) => {
        var linkTextInput = linkDiv.childNodes[1];
        var linkUrlInput = linkDiv.childNodes[2];
        var newLink = linkTextInput.value;
        var newUrl = linkUrlInput.value;
        var oldLink = JSON.parse(linkDiv.dataset.link);
        if (newLink !== oldLink.name || newUrl !== oldLink.url) {
            console.log(`Renaming ${oldLink.name} to ${newLink}`);
        }
        links.push({ name: newLink, url: newUrl });
    });
    writeLocalStorage(STORAGE_LINKS_KEY, links).then(() => {
        _createLinksList();
    });
}

function _getCheckedLinks() {
    var linksContainer = document.getElementById("links-container");
    var checkedLinks = [];
    linksContainer.childNodes.forEach((linkDiv) => {
        var linkCheckbox = linkDiv.childNodes[0].childNodes[0];
        if (linkCheckbox.checked) {
            checkedLinks.push(JSON.parse(linkDiv.dataset.link));
        }
    });
    return checkedLinks;
}

function _hasLinkEdits() {
    var linksContainer = document.getElementById("links-container");
    var hasChanges = false;
    linksContainer.childNodes.forEach((linkDiv) => {
        var linkTextInput = linkDiv.childNodes[1];
        var linkUrlInput = linkDiv.childNodes[2];
        var newLink = linkTextInput.value;
        var newUrl = linkUrlInput.value;
        var oldLink = JSON.parse(linkDiv.dataset.link);
        if (newLink !== oldLink.name || newUrl !== oldLink.url) {
            hasChanges = true;
        }
    });
    return hasChanges;
}

function _hasSelectedLinks() {
    var linksContainer = document.getElementById("links-container");
    var hasChecked = false;
    linksContainer.childNodes.forEach((linkDiv) => {
        var linkCheckbox = linkDiv.childNodes[0].childNodes[0];
        if (linkCheckbox.checked) {
            hasChecked = true;
        }
    });
    return hasChecked;
}

function _updateLinkButtonVisibilities(e) {
    var saveButton = document.getElementById("save-link-changes");
    var deleteButton = document.getElementById("delete-selected-links");
    var cancelButton = document.getElementById("cancel-link-edits");

    var hasChanges = _hasLinkEdits();
    var hasChecked = _hasSelectedLinks();

    saveButton.style.display = hasChanges ? "block" : "none";
    deleteButton.style.display = hasChecked ? "block" : "none";
    cancelButton.style.display = hasChanges || hasChecked ? "block" : "none";
}

function _handleCancelLinkEdits(e) {
    _createLinksList();
}

function _hideLinkEditButtons() {
    var saveButton = document.getElementById("save-link-changes");
    var deleteButton = document.getElementById("delete-selected-links");
    var cancelButton = document.getElementById("cancel-link-edits");

    saveButton.style.display = "none";
    deleteButton.style.display = "none";
    cancelButton.style.display = "none";
}
