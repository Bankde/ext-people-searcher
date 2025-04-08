// Helper function
async function getRealContentTab() {
    const allTabs = await browser.tabs.query({}); // get all tabs

    for (const tab of allTabs) {
        if (
            tab.active &&
            !tab.url.startsWith("moz-extension://") &&
            tab.url.startsWith("http") // optionally restrict to web pages only
        ) {
            return tab;
        }
    }

    // fallback: pick the first non-extension tab
    const contentTab = allTabs.find(
        t => !t.url.startsWith("moz-extension://") && t.url.startsWith("http")
    );

    if (contentTab) return contentTab;

    throw new Error("No valid content tab found.");
}
// ------------------------------------------------------ //

document.addEventListener("DOMContentLoaded", async () => {
    // Configs HTML
    const urlsInput = document.getElementById("urls");
    const syncServerInput = document.getElementById("server");
    const syncServerKeyInput = document.getElementById("key");
    // HTML
    const tableBody = document.getElementById("table-body");
    const addRowButton = document.getElementById("add-row");
    const searchButton = document.getElementById("search-button");
    const saveConfigButton = document.getElementById("saveConfig-button");
    const syncButton = document.getElementById("sync-button");
    // Singleton
    const peopleManager = new PeopleManager()
    const configManager = new ConfigManager();

    // Load stored values into memory
    await configManager.loadConfigs();
    await peopleManager.loadFromStorage();

    // Create row from data
    peopleManager.getAll().map(person => addRowLoad(person));
    // Load saved configs in HTML
    urlsInput.value = configManager.getConfig("urls") ?? "";
    syncServerInput.value = configManager.getConfig("syncServer") ?? "";
    syncServerKeyInput.value = configManager.getConfig("syncServerKey") ?? "";

    const toggleButton = document.getElementById("toggle-button");

    // Function to update the button UI
    function updateToggleButton() {
        if (configManager.isEnabled) {
            toggleButton.textContent = "ENABLED";
            toggleButton.classList.add("enabled");
            toggleButton.classList.remove("disabled");
        } else {
            toggleButton.textContent = "DISABLED";
            toggleButton.classList.add("disabled");
            toggleButton.classList.remove("enabled");
        }
    }

    // Button click handler to toggle state
    toggleButton.addEventListener("click", async () => {
        configManager.enableToggle();
        await configManager.saveButtonState();
        updateToggleButton();
    });

    // Load Enable Button and State
    await configManager.loadButtonState();
    updateToggleButton();

    async function saveConfig() {
        configManager.setConfig("urls", urlsInput.value);
        configManager.setConfig("syncServer", syncServerInput.value);
        configManager.setConfig("syncServerKey", syncServerKeyInput.value);
        await configManager.saveConfigs();
    }

    function addRowLoad(person) {
        if (person.status !== Person.Status.CREATED) return;
        addRow(person.firstName, person.lastName, person.reason, person.dirty);
    }

    function addRowEmpty() {
        addRow("", "", "", 1);
    }

    // Function to add a new row
    function addRow(firstName = "", lastName = "", reason = "", dirty = 1) {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="text" class="first-name input" value=""></td>
            <td><input type="text" class="last-name input" value=""></td>
            <td><input type="text" class="reason input" value=""></td>
            <td>
                <button class="remove-row">−</button>
                <input type="hidden" class="dirty" value="" hidden="true">
                <input type="hidden" class="deleted" value=0 hidden="true">
            </td>
        `;

        // Set data into row
        row.querySelector(".first-name").value = firstName;
        row.querySelector(".last-name").value = lastName;
        row.querySelector(".reason").value = reason;
        row.querySelector(".dirty").value = dirty;
        //
        tableBody.appendChild(row);

        // Add event listener for removing rows
        let deletedMarking = row.querySelector(".deleted");
        row.querySelector(".remove-row").addEventListener("click", () => {
            deletedMarking.value = 1;
            row.setAttribute("hidden", "true");
        });
        // Mark dirty to update the database
        let dirtyMarking = row.querySelector(".dirty");
        row.querySelector(".input").addEventListener("input", () => {
            dirtyMarking.value = dirty;
        });
    }

    // Save table data to storage
    async function savePeople() {
        await peopleManager.saveToStorage();
    }

    // Handle add row button
    addRowButton.addEventListener("click", () => addRowEmpty());

    // Start search when button is clicked
    searchButton.addEventListener("click", async () => {
        browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
            if (tabs.length > 0) {
                document.querySelectorAll("#table-body tr").forEach(row => {
                    let firstName = row.querySelector(".first-name").value.trim();
                    let lastName = row.querySelector(".last-name").value.trim();
                    let reason = row.querySelector(".reason").value.trim();
                    let dirty = parseInt(row.querySelector(".dirty").value);
                    let isDeleted = parseInt(row.querySelector(".deleted").value);

                    // If no change, then skip
                    if (dirty === 0) return;

                    if (firstName || lastName) {
                        if (isDeleted === 1) {
                            let rmPerson = new Person(firstName, lastName, reason, Person.Status.DELETED, 1, Date.now())
                            peopleManager.remove(rmPerson);
                        } else {
                            let newPerson = new Person(firstName, lastName, reason, Person.Status.CREATED, 1, Date.now())
                            peopleManager.add(newPerson);
                        }
                    }
                });

                await savePeople();

                const tab = await getRealContentTab();
                await browser.tabs.sendMessage(tab.id, { action: "load and search" });
            }
        });
    });

    saveConfigButton.addEventListener("click", async() => { await saveConfig() });

    syncButton.addEventListener("click", () => {

    });
});
