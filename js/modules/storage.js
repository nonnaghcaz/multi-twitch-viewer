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

const valuesInLocalStorage = async (key, values) => {
    const storedValues = await readLocalStorage(key);
    return values.every(value => storedValues.includes(value));
}

const valueInLocalStorage = async (key, value) => {
    const storedValues = await readLocalStorage(key);
    return storedValues.includes(value);
}

export { clearLocalStorage, keyInLocalStorage, readLocalStorage, removeKeyFromLocalStorage, valueInLocalStorage, valuesInLocalStorage, writeLocalStorage };

