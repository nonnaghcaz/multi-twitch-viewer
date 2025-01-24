import { LINKS_AUTHOR_PICKS, STORAGE_LINKS_KEY } from "./constants.js";
import { readLocalStorage, writeLocalStorage } from "./storage.js";


async function addAuthorLinksToStorage() {
    var links = LINKS_AUTHOR_PICKS;
    await addLinksToStorage(links)
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

export { addAuthorLinksToStorage, addLinksToStorage, removeLinksFromStorage };

