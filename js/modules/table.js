import { getStreamTitle, isChannelLiveWithRetries } from "./channel.js";
import { STORAGE_CHANNELS_KEY, TABLE_BUTTON_REFESH, TABLE_BUTTON_SELECT_ALL, TABLE_BUTTON_SELECT_CLEAR, TABLE_BUTTON_SELECT_LIVE, TABLE_DATASET_FALSE, TABLE_DATASET_TRUE, TABLE_HEADER_CHANNEL_NAME, TABLE_HEADER_CHANNEL_SELECT, TABLE_HEADER_STREAM_ISLIVE, TABLE_HEADER_STREAM_TITLE, TABLE_TRUNCATE_LENGTH } from "./constants.js";
import { readLocalStorage } from "./storage.js";

function initTable(selector) {

    DataTable.Buttons.defaults.dom.button.className = 'btn';
    var table = $(selector).DataTable({
        dom: "Bft",
        paging: false,
        columns: [
            {
                data: "selection",
                title: TABLE_HEADER_CHANNEL_SELECT,
                orderable: true,
                searchable: false,
                type: "checkbox",
                className: "channel-checkbox text-center",
                render: function(data, type, row) {
                    return `<input type='checkbox' name='channel-select' ${data ? 'checked' : ''}>`;
                }
            },
            {
                data: "channel",
                title: TABLE_HEADER_CHANNEL_NAME,
                orderable: true,
                searchable: true,
                render: function(data, type, row) {
                    return `<a href="https://twitch.tv/${data}" target="_blank">${data}</a>`;
                }
            },
            {
                data: "isLive",
                title: TABLE_HEADER_STREAM_ISLIVE,
                orderable: true,
                searchable: false,
                className: "text-center",
                render: function(data, type, row) {
                    return data === "Live" ? `<span class="badge bg-success">${data}</span>` : `<span class="badge bg-danger">${data}</span>`;
                }
            },
            {
                data: "streamTitle",
                title: TABLE_HEADER_STREAM_TITLE,
                orderable: false,
                searchable: true,
                render: function(data, type, row) {
                    if (type === "display") {
                        if (!data) {
                            return "";
                        }
                        var _text = data.length > TABLE_TRUNCATE_LENGTH ? data.slice(0, TABLE_TRUNCATE_LENGTH) + "...": data;
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
                title: "Refresh Table",
                text: TABLE_BUTTON_REFESH,
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
                text: TABLE_BUTTON_SELECT_ALL,
                className: "btn-secondary",
                action: function(e, dt, node, config) {
                    var selectAll = document.getElementById("select-all");
                    selectAll.checked = !selectAll.checked;
                    selectAll.dispatchEvent(new Event("change"));
                }
            },
            {
                title: "Select Live",
                text: TABLE_BUTTON_SELECT_LIVE,
                className: "btn-secondary",
                action: function(e, dt, node, config) {
                    var selectLive = document.getElementById("select-live");
                    selectLive.checked = !selectLive.checked;
                    selectLive.dispatchEvent(new Event("change"));
                }
            },
            {
                title: "Clear Selection",
                text: TABLE_BUTTON_SELECT_CLEAR,
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
    isChannelLiveWithRetries(channel).then((isLive) => {
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
            }).catch((error) => {
                console.error(`Failed to get stream title for ${channel}: ${error}`);
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

