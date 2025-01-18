const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key] || []);
        });
    });
}

const writeLocalStorage = async (key, value) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, function () {
            resolve();
        });
    });
}

const clearLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(function () {
            resolve();
        });
    });
}

const keyInLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(key in result);
        });
    });
}

const removeKeyFromLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove(key, function () {
            resolve();
        });
    });
}

export { clearLocalStorage, keyInLocalStorage, readLocalStorage, removeKeyFromLocalStorage, writeLocalStorage };
