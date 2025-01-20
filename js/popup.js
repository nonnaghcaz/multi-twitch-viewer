
import { addChannelsToStorage, removeChannelsFromStorage } from "./modules/channel.js";
import { POPUP_CHANNEL_ADD_BUTTON_ID, POPUP_CHANNEL_INPUT_ID, POPUP_CHANNEL_TABLE_ID, POPUP_INPUT_ERROR_ID, POPUP_SUBMIT_BUTTON_ID, STORAGE_CHANNELS_KEY, STORAGE_THEME_KEY, TABLE_DELETE_BUTTON_ID } from "./modules/constants.js";
import { readLocalStorage, valueInLocalStorage, writeLocalStorage } from "./modules/storage.js";
import { getChannelsFromTabUrl, isOnTwitchPage, watchChannels } from "./modules/tab.js";
import { clearTable, drawTable, getSelectedChannels, initTable } from "./modules/table.js";

const POPUP_CHANNEL_TABLE_SELECTOR = `#${POPUP_CHANNEL_TABLE_ID}`;
const THEMES = ["dark", "light"];

document.addEventListener("DOMContentLoaded", function() {
    _onReady();
});

async function _handleDeleteSelectedChannels(e) {
    var selectedChannels = getSelectedChannels(POPUP_CHANNEL_TABLE_SELECTOR);
    if (selectedChannels.length > 0) {
        removeChannelsFromStorage(selectedChannels).then(() => {
            clearTable(POPUP_CHANNEL_TABLE_SELECTOR);
            drawTable(POPUP_CHANNEL_TABLE_SELECTOR);
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
        clearTable(POPUP_CHANNEL_TABLE_SELECTOR);
        drawTable(POPUP_CHANNEL_TABLE_SELECTOR);
    });
}

async function writeThemeToStorage(theme) {
    return writeLocalStorage(STORAGE_THEME_KEY, theme);
}


async function readThemeFromStorage() {
    return readLocalStorage(STORAGE_THEME_KEY);
}

function _setThemeFromStorage() {
    readThemeFromStorage().then((theme) => {
        if (THEMES.includes(theme)) {
            _setHtmlTheme(theme);
            const themeRadio = document.getElementById(`theme-${theme}`);
            if (themeRadio) {
                themeRadio.checked = true;
            }
        }
    });
}

function _setHtmlTheme(theme) {
    const htmlelement = document.getElementsByTagName("html")[0];
    htmlelement.setAttribute("data-bs-theme", theme);
}

function _handleWatchChannels(e) {
    var selectedChannels = getSelectedChannels(POPUP_CHANNEL_TABLE_SELECTOR);
    if (selectedChannels.length > 0) {
        watchChannels(selectedChannels);
    }
}

function _onThemeRadioChange(e) {
    const theme = e.target.value;
    console.log("Theme changed to", theme);
    writeThemeToStorage(theme).then(() => {
        _setHtmlTheme(theme);
    });
}

function _onReady() {

    const addChannelButton = document.getElementById(POPUP_CHANNEL_ADD_BUTTON_ID);
    const submitButton = document.getElementById(POPUP_SUBMIT_BUTTON_ID);
    const inputError = document.getElementById(POPUP_INPUT_ERROR_ID);
    const channelInput = document.getElementById(POPUP_CHANNEL_INPUT_ID);
    const deleteButton = document.getElementById(TABLE_DELETE_BUTTON_ID);
    const themeName = "theme";
    const themesContainer = document.getElementById("themes-container");
    THEMES.forEach((theme) => {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "theme";
        radio.id = `theme-${theme}`;
        radio.value = theme;
        radio.classList.add("btn-check");
        radio.classList.add("btn-check-dark");

        const label = document.createElement("label");
        label.htmlFor = `theme-${theme}`;
        label.classList.add("btn");
        label.classList.add("btn-outline-secondary");
        label.classList.add("btn-sm");
        label.innerText = theme;

        themesContainer.appendChild(radio);
        themesContainer.appendChild(label);
    });

    _setThemeFromStorage();

    const themeRadios = document.querySelectorAll(`input[name="${themeName}"]`);
    themeRadios.forEach((radio) => {
        radio.addEventListener("change", _onThemeRadioChange);
    });

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
                if (channels.includes("directory")) {
                    return;
                }
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
    initTable(POPUP_CHANNEL_TABLE_SELECTOR);
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





