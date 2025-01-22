import { getStreamTitle, isChannelLive } from "./channel.js";
import { STORAGE_CHANNELS_KEY, TABLE_DATASET_FALSE, TABLE_DATASET_TRUE } from "./constants.js";
import { readLocalStorage } from "./storage.js";
import { isWatchingChannel } from "./tab.js";

const TRUNCATE_TITLE_LENGTH = 30;

function initTable(selector) {

    DataTable.Buttons.defaults.dom.button.className = 'btn';
    var table = $(selector).DataTable({
        dom: "Bft",
        columns: [
            {
                title: '<span title="Channel Selection"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM337 209L209 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L303 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg></span>',
                orderable: true,
searchable: false,
                type: "checkbox",
                className: "channel-checkbox text-center",
                render: function(data, type, row) {
                    return `<input type='checkbox' name='channel-select' ${data ? 'checked' : ''}>`;
                }
            },
            {
                title: '<span title="Channel Name/Link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 64l0 288 512 0 0-288L64 64zM0 64C0 28.7 28.7 0 64 0L576 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 416c-35.3 0-64-28.7-64-64L0 64zM128 448l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-384 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg> | <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg></span>',
                orderable: true,
searchable: true,
                render: function(data, type, row) {
                    return `<a href="https://twitch.tv/${data}" target="_blank">${data}</a>`;
                }
            },
            {
                title: '<span title="Stream Live Status"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M576 0c17.7 0 32 14.3 32 32l0 448c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-448c0-17.7 14.3-32 32-32zM448 96c17.7 0 32 14.3 32 32l0 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-352c0-17.7 14.3-32 32-32zM352 224l0 256c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32s32 14.3 32 32zM192 288c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160c0-17.7 14.3-32 32-32zM96 416l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32z"/></svg></span>',
                orderable: true,
searchable: false,
                className: "text-center",
                render: function(data, type, row) {
                    return data === "Live" ? `<span class="badge bg-success">${data}</span>` : `<span class="badge bg-danger">${data}</span>`;
                }
            },
            {
                title: '<span title="Live Stream Title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg></span>',
                orderable: false,
searchable: true,
                render: function(data, type, row) {
                    if (type === "display") {
                        if (!data) {
                            return "";
                        }
                        var _text = data.length > TRUNCATE_TITLE_LENGTH ? data.slice(0, TRUNCATE_TITLE_LENGTH) + "...": data;
                        return `<span title="${data}">${_text}</span>`;
                    }
                    return data;
                }
            }
        ],
        columnDefs: [
            { className: "dt-head-center", targets: [ 0, 1, 2, 3] },
            { className: "stream-title", targets: [3] },
        ],
        scrollY: "300px",
        order: [[0, "desc"], [2, "asc"], [1, "asc"]],
        buttons: [
            {
                title: "Refresh",
                text: '<span title="Refresh Table"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg></span>',
                className: "btn-primary",
                action: function(e, dt, node, config) {
                    var selectAll = document.getElementById("select-all");
                    selectAll.checked = false;
                    var selectLive = document.getElementById("select-live");
                    selectLive.checked = false;
                    clearTable(selector);
                    drawTable(selector);
                }
            },
            {
                title: "Select All",
                text: '<span title="Select All Channels"><input type="checkbox" id="select-all"> All</span>',
                className: "btn-secondary",
                action: function(e, dt, node, config) {
                    var selectAll = document.getElementById("select-all");
                    selectAll.checked = !selectAll.checked;
                    selectAll.dispatchEvent(new Event("change"));
                }
            },
            {
                title: "Select Live",
                text: '<span title="Select Live Channels"><input type="checkbox" id="select-live"> Live</span>',
                className: "btn-secondary",
                action: function(e, dt, node, config) {
                    var selectLive = document.getElementById("select-live");
                    selectLive.checked = !selectLive.checked;
                    selectLive.dispatchEvent(new Event("change"));
                }
            },
            {
                text: '<span title="Clear Selected Channels"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="icon"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6l0 29.1L364.3 320l29.1 0c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"/></svg></span>',
                className: "btn-danger",
                action: function(e, dt, node, config) {
                    var table = getTable(selector);
                    var rows = table.rows().nodes();
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var checkbox = $(row).find('input[type="checkbox"][name="channel-select"]');
                        checkbox.prop('checked', false);
                    }
                    var selectAll = document.getElementById("select-all");
                    selectAll.checked = false;
                    var selectLive = document.getElementById("select-live");
                    selectLive.checked = false;
                    _updateDeleteButtonVisibility(selector);
                }
            }
        ]
    });

    // Custom sorting for checkbox column
    $.fn.dataTable.ext.order['checkbox'] = function(settings, col) {
        return this.api().column(col, {order: 'index'}).nodes().map(function(td, i) {
            return $(td).find('input[type="checkbox"]').prop('checked') ? 1 : 0;
        });
    };

    drawTable(selector);

    var selectAll = document.getElementById("select-all");
    selectAll.addEventListener("change", function(e) {
        _handleSelectAll(selector, e);
    });
    selectAll.addEventListener("click", (e) => e.stopPropagation());

    var selectLive = document.getElementById("select-live");
    selectLive.addEventListener("change", function(e) {
        _handleSelectLive(selector, e);
    });
    selectLive.addEventListener("click", (e) => e.stopPropagation());

    return table;
}

function _handleSelectAll(selector, e) {
    var targetChecked = e.target.checked;
    var table = getTable(selector);
    var rows = table.rows().nodes();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var checkbox = $(row).find('input[type="checkbox"][name="channel-select"]');
        checkbox.prop('checked', targetChecked);
    }
    _updateDeleteButtonVisibility(selector);
}

function _handleSelectLive(selector, e) {
    var targetChecked = e.target.checked;
    var table = getTable(selector);
    var rows = table.rows().nodes();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.dataset.isLive === TABLE_DATASET_FALSE) {
            var checkbox = $(row).find('input[type="checkbox"][name="channel-select"]');
            checkbox.prop('checked', targetChecked);
        }
    }
    _updateDeleteButtonVisibility(selector);
}

function _areAnyChecked(selector) {
    var table = getTable(selector);
    var rows = table.rows().nodes();
    var anyChecked = false;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var checkbox = $(row).find('input[type="checkbox"][name="channel-select"]');
        if (checkbox.prop('checked')) {
            anyChecked = true;
            break;
        }
    }
    return anyChecked;
}

function _updateDeleteButtonVisibility(selector) {
    var anyChecked = _areAnyChecked(selector);
    var deleteButton = document.getElementById("delete-button");
    deleteButton.style.display = anyChecked ? "block" : "none";
}

function selectChannels(selector, channels) {
    var table = getTable(selector);
    var rows = table.rows().nodes();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var channel = row.dataset.channel;
        var checkbox = row.querySelector(".channel-checkbox");
        checkbox.checked = channels.includes(channel);
    }
}

function drawTable(selector) {
    readLocalStorage(STORAGE_CHANNELS_KEY).then((channels) => {
        channels.forEach((channel) => {
            addRow(selector, channel);
        });
    });
}

function clearTable(selector) {
    var table = getTable(selector);
    table.clear();
}

function addRow(selector, channel) {
    var table = getTable(selector);
    isChannelLive(channel).then((isLive) => {
        isWatchingChannel(channel).then((isWatching) => {
            getStreamTitle(channel).then((streamTitle) => {
                var row = table.row.add([
                    isWatching ? 1 : 0, 
                    channel, 
                    isLive ? "Live" : "Offline",
                    isLive ? streamTitle : ""
                ]).draw().node();
                row.dataset.channel = channel;
                row.dataset.isLive = isLive ? TABLE_DATASET_FALSE : TABLE_DATASET_TRUE;
                var checkbox = $(row).find('input[type="checkbox"]');
                checkbox.prop('checked', isWatching);
                checkbox.on('change', function() {
                    _updateDeleteButtonVisibility(selector);
                });
                _updateDeleteButtonVisibility(selector);
            });
        });
    });
}

function getTable(selector) {
    // Return existing DataTable instance
    return $(selector).DataTable();
}

function getSelectedRows(selector, asArray=false) {
    var table = getTable(selector);
    var data = table
    .rows( function ( idx, data, node ) {
        return $(node).find('input[type="checkbox"][name="channel-select"]').prop('checked');
    } )

    if (asArray) {
        data = data
        .data()
        .toArray();
    }
    return data
}

function getSelectedChannels(selector) {
    var selectedRows = getSelectedRows(selector, true);
    return selectedRows.map((row) => row[1]);
}

function getLiveChannels(selector) {
    var table = getTable(selector);
    var rows = table.rows().nodes();
    var liveChannels = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.dataset.isLive === TABLE_DATASET_FALSE) {
            liveChannels.push(row.dataset.channel);
        }
    }
    return liveChannels;
}

function allLiveChannelsChecked(selector) {
    return _areChannelsChecked(selector, true);
}

function allChannelsChecked(selector) {
    return _areChannelsChecked(selector, false);
}

function _areChannelsChecked(selector, isLiveCheck=false) {
    var table = getTable(selector);
    var rows = table.rows().nodes();
    var allChecked = true;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (isLiveCheck && row.dataset.isLive !== TABLE_DATASET_FALSE) {
            return;
        }
        var checkbox = row.querySelector(".channel-checkbox");
        if (!checkbox.checked) {
            allChecked = false;
        }
    }
    return allChecked;
}



export { addRow, allChannelsChecked, allLiveChannelsChecked, clearTable, drawTable, getLiveChannels, getSelectedChannels, getTable, initTable };

