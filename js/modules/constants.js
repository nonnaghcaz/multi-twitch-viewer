import { FA_BROOM, FA_CIRCLE_CHECK, FA_CIRCLE_INFO, FA_CIRCLE_XMARK, FA_LINK, FA_LINK_SLASH, FA_ROTATE, FA_SIGNAL, FA_SQUARE_CHECK, FA_TV } from "./fa_svgs.js";

// channel.js
const TWITCH_DEFAULT_RETRY_DELAY = 1000;
const TWITCH_DEFAULT_MAX_TRIES = 3;
const TWITCH_STREAM_TITLE_XPATH = "//meta[contains(@name, 'description')]";
const TWITCH_STREAM_TITLE_ATTRIBUTE = "content";
const TWITCH_STREAM_ISLIVE_XPATH = '//script[@type="application/ld+json" and contains(text(), "isLiveBroadcast")]';
const TWITCH_STREAM_ISLIVE_TEXT = "isLiveBroadcast";

// storage.js
const STORAGE_CHANNELS_KEY = "mtv_channels";
const STORAGE_THEME_KEY = "mtv_theme";
const STORAGE_LINKS_KEY = "mtv_links";

// popup.js
const POPUP_CHANNEL_TABLE_ID = "channel-table";
const POPUP_CHANNEL_ADD_BUTTON_ID = "add-button";
const POPUP_CHANNEL_INPUT_ID = "channel-input";
const POPUP_INPUT_ERROR_ID = "input-error";
const POPUP_SUBMIT_BUTTON_ID = "submit-button";

// table.js
const TABLE_REFRESH_BUTTON_ID = "refresh-button";
const TABLE_SELECT_ALL_ID = "select-all";
const TABLE_SELECT_LIVE_ID = "select-live";
const TABLE_SELECT_CLEAR_ID = "select-clear";
const TABLE_DELETE_BUTTON_ID = "delete-button";
const TABLE_TRUNCATE_LENGTH = 25;

const TABLE_DATASET_CHANNEL = "channel";
const TABLE_DATASET_IS_LIVE = "isLive";

const TABLE_DATASET_TRUE = "1";
const TABLE_DATASET_FALSE = "0";


const TABLE_HEADER_CHANNEL_SELECT = `<span title="Channel Selection">${FA_SQUARE_CHECK}</span>`;
const TABLE_HEADER_CHANNEL_NAME = `<span title="Channel Name/Link">${FA_TV} | ${FA_LINK}</span>`;
const TABLE_HEADER_STREAM_ISLIVE = `<span title="Stream Live Status">${FA_SIGNAL}</span>`;
const TABLE_HEADER_STREAM_TITLE = `<span title="Live Stream Title">${FA_CIRCLE_INFO}</span>`;

const TABLE_BUTTON_REFESH = `<span title="Refresh Table">${FA_ROTATE}</span>`;
const TABLE_BUTTON_SELECT_ALL = `<span title="Select All Channels"><input type="checkbox" id="select-all"> All</span>`
const TABLE_BUTTON_SELECT_LIVE = `<span title="Select Live Channels"><input type="checkbox" id="select-live"> Live</span>`
const TABLE_BUTTON_SELECT_CLEAR = `<span title="Clear Selected Channels">${FA_BROOM}</span>`

export {
    FA_BROOM, FA_CIRCLE_CHECK, FA_CIRCLE_INFO, FA_CIRCLE_XMARK, FA_LINK, FA_LINK_SLASH, FA_ROTATE, FA_SIGNAL, FA_SQUARE_CHECK, FA_TV, POPUP_CHANNEL_ADD_BUTTON_ID,
    POPUP_CHANNEL_INPUT_ID, POPUP_CHANNEL_TABLE_ID, POPUP_INPUT_ERROR_ID,
    POPUP_SUBMIT_BUTTON_ID, STORAGE_CHANNELS_KEY, STORAGE_LINKS_KEY, STORAGE_THEME_KEY, TABLE_BUTTON_REFESH, TABLE_BUTTON_SELECT_ALL, TABLE_BUTTON_SELECT_CLEAR, TABLE_BUTTON_SELECT_LIVE, TABLE_DATASET_CHANNEL, TABLE_DATASET_FALSE, TABLE_DATASET_IS_LIVE,
    TABLE_DATASET_TRUE, TABLE_DELETE_BUTTON_ID, TABLE_HEADER_CHANNEL_NAME, TABLE_HEADER_CHANNEL_SELECT, TABLE_HEADER_STREAM_ISLIVE, TABLE_HEADER_STREAM_TITLE, TABLE_REFRESH_BUTTON_ID,
    TABLE_SELECT_ALL_ID, TABLE_SELECT_CLEAR_ID, TABLE_SELECT_LIVE_ID, TABLE_TRUNCATE_LENGTH, TWITCH_DEFAULT_MAX_TRIES, TWITCH_DEFAULT_RETRY_DELAY, TWITCH_STREAM_ISLIVE_TEXT, TWITCH_STREAM_ISLIVE_XPATH, TWITCH_STREAM_TITLE_ATTRIBUTE, TWITCH_STREAM_TITLE_XPATH
};

