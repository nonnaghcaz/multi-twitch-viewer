import { getChannelData, getChannelDatas } from "./channel.js";
import { FA_CIRCLE_CHECK, FA_CIRCLE_XMARK, STORAGE_CHANNELS_KEY, TABLE_BUTTON_REFESH, TABLE_BUTTON_SELECT_ALL, TABLE_BUTTON_SELECT_CLEAR, TABLE_BUTTON_SELECT_LIVE, TABLE_DATASET_FALSE, TABLE_DATASET_TRUE, TABLE_HEADER_CHANNEL_NAME, TABLE_HEADER_CHANNEL_SELECT, TABLE_HEADER_STREAM_ISLIVE, TABLE_HEADER_STREAM_TITLE, TABLE_TRUNCATE_LENGTH } from "./constants.js";
import { FA_GRIP_LINES, FA_SLIDERS } from "./fa_svgs.js";
import { readLocalStorage } from "./storage.js";

var _currentIndex = 0;

function truncateText(text, length) {
    return text.length > length ? text.slice(0, length) + "..." : text;
}

function initTable(selector) {

    DataTable.Buttons.defaults.dom.button.className = 'btn';
    var table = $(selector).DataTable({
        dom: "Bft",
        paging: false,
        autoWidth: false,
        columns: [
            {
                data: "index",
                title: FA_SLIDERS,
                searchable: false,
                orderable: false,
                width: "10%",
                render: function(data, type, row) {
                    if (type === "display") {
                        var _p = new DOMParser()
                        var _span = document.createElement("span");
                        var _svg = _p.parseFromString(FA_GRIP_LINES, "image/svg+xml").documentElement;
                        _svg.classList.add("icon");
                        _span.classList.add("badge");
                        _span.classList.add("badge-primary");
                        _span.style.cursor = "grab";
                        _span.title = "Drag to Reorder";
                        _span.appendChild(_svg);

                        
                        return _span.outerHTML;
                    }
                    return data;
                }
            },
            {
                data: "selection",
                title: TABLE_HEADER_CHANNEL_SELECT,
                orderable: false,
                searchable: false,
                type: "checkbox",
                className: "channel-checkbox",
                render: function(data, type, row) {
                    return `<input type='checkbox' name='channel-select' style='cursor: pointer;' ${data ? 'checked' : ''}>`;
                },
                width: "10%",
            },
            {
                data: "channel",
                title: TABLE_HEADER_CHANNEL_NAME,
                orderable: false,
                searchable: true,
                render: function(data, type, row) {
                    if (type === "display") {

                        return `<a title="${data}" class="stream-link" href="https://www.twitch.tv/${data}" target="_blank">${truncateText(data, 10)}</a>`;
                    }
                    return data;
                },
                width: "30%"
            },
            {
                data: "isLive",
                title: TABLE_HEADER_STREAM_ISLIVE,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    // return data === "Live" ? `<span class="badge bg-success">${data}</span>` : `<span class="badge bg-danger">${data}</span>`;
                    if (type === "display") {
                        var _p = new DOMParser()
                        var _span = document.createElement("span");
                        var _checkSvg = _p.parseFromString(FA_CIRCLE_CHECK, "image/svg+xml").documentElement;
                        _checkSvg.classList.add("icon");
                        var _xmarkSvg = _p.parseFromString(FA_CIRCLE_XMARK, "image/svg+xml").documentElement;
                        _xmarkSvg.classList.add("icon");
                        _span.classList.add("badge");
                        if (data == 1) {
                            _span.classList.add("bg-success");
                            _span.title = "Live";
                            _span.appendChild(_checkSvg);
                        } else {
                            _span.classList.add("bg-danger");
                            _span.title = "Offline";
                            _span.appendChild(_xmarkSvg);
                        }
                        
                        return _span.outerHTML;
                    }
                    return data;
                },
                width: "10%"
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
                        return `<span title="${data.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" class="stream-title" style="cursor:help;">${truncateText(data, TABLE_TRUNCATE_LENGTH)}</span>`;
                    }
                    return data;
                },
                width: "50%"
            }
        ],
        columnDefs: [
            { className: "dt-head-center", targets: [ 0, 1, 2, 3, 4] },
            { className: "dt-body-center", targets: [ 0, 1, 3] }
        ],
        scrollY: "300px",
        // order: [[1, "desc"], [3, "desc"], [2, "asc"]],
        rowReorder: {
            dataSrc: "index",
        },
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

function drawTable(selector) {
    var table = getTable(selector);
    readLocalStorage(STORAGE_CHANNELS_KEY).then((channels) => {
        addRows(selector, channels);
    });
    table.columns.adjust().draw();
}

function clearTable(selector) {
    var table = getTable(selector);
    table.clear();
}

function addRows(selector, channels) {
    getChannelDatas(channels).then((datas) => {
        _addChannelDatasToTable(selector, datas);
    });
}

function _addChannelDatasToTable(selector, datas) {
    datas.forEach((data) => {
        _addChannelDataToTable(selector, data);
    });
}

function _addChannelDataToTable(selector, data) {
    var table = getTable(selector);
    var isLive = data.isLive || false;
    var streamTitle = data.streamTitle || "";
    var isWatching = data.isWatching || false;
    var channel = data.channel || "";
    var row = table.row.add({
        index: data.index,
        selection: isWatching ? 1 : 0, 
        channel: channel,
        isLive: isLive ? 1 : 0,
        streamTitle: streamTitle
    }).draw().node();
    if (!row) {
        console.error("Failed to add row to table", JSON.stringify(data));
        return;
    }
    row.dataset.channel = channel;
    row.dataset.isLive = isLive ? TABLE_DATASET_FALSE : TABLE_DATASET_TRUE;
    row.dataset.streamTitle = streamTitle;
    row.dataset.isWatching = isWatching ? TABLE_DATASET_TRUE : TABLE_DATASET_FALSE;
    var checkbox = $(row).find('input[type="checkbox"]');
    checkbox.prop('checked', isWatching);
    checkbox.on('change', function() {
        _updateDeleteButtonVisibility(selector);
    });
    _updateDeleteButtonVisibility(selector);
}

function addRow(selector, channel) {
    getChannelData(channel).then((data) => {
        _addChannelDataToTable(selector, data);
    }).catch((error) => {
        console.error(`Failed to get channel data for ${channel}: ${error}`);
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
    return selectedRows.map((row) => row.channel);
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

