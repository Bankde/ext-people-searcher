// Singleton
let Loaded = false;

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
    if (Loaded === false) {
        await configManager.loadConfigs();
        await peopleManager.loadFromStorage();
        Loaded = true;
    }

    // Create row from data
    peopleManager.getAll().map(person => addRowLoad(person));
    // Load saved configs in HTML
    urlsInput.value = configManager.getConfig("urls");
    syncServerInput.value = configManager.getConfig("syncServer");
    syncServerKeyInput.value = configManager.getConfig("syncServerKey");

    async function saveConfig() {
        configManager.setConfig("urls", urlsInput.value);
        configManager.setConfig("syncServer", syncServerInput.value);
        configManager.setConfig("syncServerKey", syncServerKeyInput.value);
        await configManager.saveConfigs();
    }

    function addRowLoad(person) {
        console.log(person);
        addRow(person.firstName, person.lastName, person.reason, person.dirty);
    }

    function addRowEmpty() {
        addRow("", "", "", 1);
    }

    // Function to add a new row
    function addRow(firstName = "", lastName = "", reason = "", dirty = 1) {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="text" class="first-name input" value="${firstName}"></td>
            <td><input type="text" class="last-name input" value="${lastName}"></td>
            <td><input type="text" class="reason input" value="${reason}"></td>
            <td>
                <button class="remove-row">−</button>
                <input type="text" class="dirty" value=${dirty} hidden="true">
            </td>
        `;

        tableBody.appendChild(row);

        // Add event listener for removing rows
        row.querySelector(".remove-row").addEventListener("click", () => removeRow(row));
        // Mark dirty to update the database
        let dirtyMarking = row.querySelector(".dirty")
        row.querySelector(".input").addEventListener("input", () => {
            dirtyMarking.value = dirty;
        });
    }

    // Function to remove a row
    function removeRow(row) {
        row.remove();
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
                    let dirty = row.querySelector(".dirty").value;

                    // If no change, then skip
                    if (dirty === 0) return;

                    if (firstName || lastName) {
                        let newPerson = new Person(firstName, lastName, reason, Person.Status.CREATED, 1, Date.now())
                        peopleManager.add(newPerson);
                    }
                });

                await savePeople();

                browser.tabs.sendMessage(tabs[0].id, {
                    action: "load and search"
                });
            }
        });
    });

    saveConfigButton.addEventListener("click", async() => { await saveConfig() });

    syncButton.addEventListener("click", () => {

    });
});
