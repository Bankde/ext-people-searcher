let configManager = new ConfigManager();
let peopleManager = new PeopleManager();
// A cache separated from localStorage
// We will mark a person who has been alerted so we don't get dupe.
let people = [];

async function searchTextOnPage() {
    await configManager.loadButtonState();
    if (!configManager.isEnabled) return;

    let pageUrl = window.location.href;
    let urls = configManager.parseUrls();

    // Check if the current page matches any of the given URLs
    if (!urls.some(url => pageUrl.includes(url.trim()))) {
        return;
    }

    let foundPeople = [];
    let bodyText = document.body.innerText.toLowerCase();

    for (let person of people) {
        let fullName = (`${person.firstName.trim()} ${person.lastName.trim()}`).trim().toLowerCase();
        if (person["found"] !== 1 && bodyText.includes(fullName)) {
            foundPeople.push(`${fullName} (${person.reason})`);
            person["found"] = 1;
        }
    }

    if (foundPeople.length > 0) {
        alert("Found: " + foundPeople.join("\n"));
    }
}

async function initData() {
    await configManager.loadConfigs();
    await peopleManager.loadFromStorage();
    people = peopleManager.getAll();
}

// Fetch stored data and start searching
async function initSearch() {
    await initData();
    await searchTextOnPage();

    // Watch for dynamic content changes
    let observer = new MutationObserver(async() => { await searchTextOnPage(); });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Run search on page load
if (document.readyState !== 'loading') {
    (async () => { await initSearch() })();
} else {
    document.addEventListener("DOMContentLoaded", async() => { await initSearch() });
}

// Keep listening for manual searches from popup
browser.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
    if (request.action === "load and search") {
        await initData();
        await searchTextOnPage();
        sendResponse({ success: true });
    }
    return true;
});
