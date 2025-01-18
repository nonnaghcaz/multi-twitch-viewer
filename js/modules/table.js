import { isChannelLive } from "./channel.js";
import { CHANNEL_TABLE_ID, DATASET_IS_LIVE_FALSE, DATASET_IS_LIVE_TRUE, STORAGE_CHANNELS_KEY } from "./constants.js";
import { readLocalStorage } from "./storage.js";
import { isWatchingChannel } from "./tab.js";

function initTable() {

    DataTable.Buttons.defaults.dom.button.className = 'btn';
    var table = $("#" + CHANNEL_TABLE_ID).DataTable({
        dom: "Bt",
        columns: [
            {
                title: "Select",
                orderable: true,
                type: "checkbox",
                className: "channel-checkbox text-center",
                render: function(data, type, row) {
                    return `<input type='checkbox' name='channel-select' ${data ? 'checked' : ''}>`;
                }
            },
            {
                title: "Channel",
                orderable: true
            },
            {
                title: "Status",
                orderable: true,
                className: "text-center",
                render: function(data, type, row) {
                    return data === "Live" ? `<span class="badge bg-success">${data}</span>` : `<span class="badge bg-danger">${data}</span>`;
                }
            }
        ],
        scrollY: "300px",
        order: [[0, "desc"], [2, "asc"], [1, "asc"]],
        buttons: [
            {
                text: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>',
                className: "btn-primary",
                action: function(e, dt, node, config) {
                    var selectAll = document.getElementById("select-all");
                    selectAll.checked = false;
                    var selectLive = document.getElementById("select-live");
                    selectLive.checked = false;
                    clearTable();
                    drawTable();
                }
            },
            {
                text: "<input type='checkbox' id='select-all'> All",
                className: "btn-secondary",
                action: function(e, dt, node, config) {
                    var selectAll = document.getElementById("select-all");
                    selectAll.checked = !selectAll.checked;
                    selectAll.dispatchEvent(new Event("change"));
                }
            },
            {
                text: "<input type='checkbox' id='select-live'> Live",
                className: "btn-secondary",
                action: function(e, dt, node, config) {
                    var selectLive = document.getElementById("select-live");
                    selectLive.checked = !selectLive.checked;
                    selectLive.dispatchEvent(new Event("change"));
                }
            },
            {
                text: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="icon"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6l0 29.1L364.3 320l29.1 0c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"/></svg>',
                className: "btn-danger",
                action: function(e, dt, node, config) {
                    var table = getTable();
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
                    _updateDeleteButtonVisibility();
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

    drawTable();

    var selectAll = document.getElementById("select-all");
    selectAll.addEventListener("change", _handleSelectAll);
    selectAll.addEventListener("click", (e) => e.stopPropagation());

    var selectLive = document.getElementById("select-live");
    selectLive.addEventListener("change", _handleSelectLive);
    selectLive.addEventListener("click", (e) => e.stopPropagation());

    return table;
}

function _handleSelectAll(e) {
    var targetChecked = e.target.checked;
    var table = getTable();
    var rows = table.rows().nodes();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var checkbox = $(row).find('input[type="checkbox"][name="channel-select"]');
        checkbox.prop('checked', targetChecked);
    }
    _updateDeleteButtonVisibility();
}

function _handleSelectLive(e) {
    var targetChecked = e.target.checked;
    var table = getTable();
    var rows = table.rows().nodes();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.dataset.isLive === DATASET_IS_LIVE_TRUE) {
            var checkbox = $(row).find('input[type="checkbox"][name="channel-select"]');
            checkbox.prop('checked', targetChecked);
        }
    }
    _updateDeleteButtonVisibility();
}

function _areAnyChecked() {
    var table = getTable();
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

function _updateDeleteButtonVisibility() {
    var anyChecked = _areAnyChecked();
    var deleteButton = document.getElementById("delete-button");
    deleteButton.style.display = anyChecked ? "block" : "none";
}

function selectChannels(channels) {
    var table = getTable();
    var rows = table.rows().nodes();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var channel = row.dataset.channel;
        var checkbox = row.querySelector(".channel-checkbox");
        checkbox.checked = channels.includes(channel);
    }
}

function drawTable() {
    readLocalStorage(STORAGE_CHANNELS_KEY).then((channels) => {
        channels.forEach((channel) => {
            addRow(channel);
        });
    });
}

function clearTable() {
    var table = getTable();
    table.clear();
}

function addRow(channel) {
    var table = getTable();
    isChannelLive(channel).then((isLive) => {
        isWatchingChannel(channel).then((isWatching) => {
            var row = table.row.add([
                isWatching ? 1 : 0, 
                channel, 
                isLive ? "Live" : "Offline"
            ]).draw().node();
            row.dataset.channel = channel;
            row.dataset.isLive = isLive ? DATASET_IS_LIVE_TRUE : DATASET_IS_LIVE_FALSE;
            var checkbox = $(row).find('input[type="checkbox"]');
            checkbox.prop('checked', isWatching);
            checkbox.on('change', _updateDeleteButtonVisibility);
            _updateDeleteButtonVisibility();
        });
    });
}

function getTable() {
    // Return existing DataTable instance
    return $("#" + CHANNEL_TABLE_ID).DataTable();
}

function getSelectedRows(asArray=false) {
    var table = getTable();
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

function getSelectedChannels() {
    var selectedRows = getSelectedRows(true);
    return selectedRows.map((row) => row[1]);
}

function getLiveChannels() {
    var table = getTable();
    var rows = table.rows().nodes();
    var liveChannels = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.dataset.isLive === DATASET_IS_LIVE_TRUE) {
            liveChannels.push(row.dataset.channel);
        }
    }
    return liveChannels;
}

function allLiveChannelsChecked() {
    return _areChannelsChecked(true);
}

function allChannelsChecked() {
    return _areChannelsChecked(false);
}

function _areChannelsChecked(isLiveCheck=false) {
    var table = getTable();
    var rows = table.rows().nodes();
    var allChecked = true;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (isLiveCheck && row.dataset.isLive !== DATASET_IS_LIVE_TRUE) {
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

