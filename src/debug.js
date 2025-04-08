document.addEventListener("DOMContentLoaded", async () => {
    // HTML
    const tableBody = document.getElementById("table-body");
    const saveButton = document.getElementById("save-button");
    const saveConfigButton = document.getElementById("saveConfig-button");
    const lastSyncTimeInput = document.getElementById("lastSyncTime");
    // Singleton
    const peopleManager = new PeopleManager();
    const configManager = new ConfigManager();
    // Load stored values into memory
    await configManager.loadConfigs();
    await peopleManager.loadFromStorage();

    // Create row from data
    peopleManager.getAll().map(person => addRow(person));
    // Load saved configs in HTML
    lastSyncTimeInput.value = configManager.getConfig("lastSyncTime") ?? "";

    async function saveConfig() {
        configManager.setConfig("lastSyncTime", lastSyncTimeInput.value);
        await configManager.saveConfigs();
    }

    // Function to add a new row
    function addRow(person) {
        let row = document.createElement("tr");
        let { firstName, lastName, reason, status, dirty, timestamp } = person;

        row.innerHTML = `
            <td><input type="text" class="first-name input" value=""></td>
            <td><input type="text" class="last-name input" value=""></td>
            <td><input type="text" class="reason input" value=""></td>
            <td><input type="text" class="status input" value=""></td></td>
            <td><input type="text" class="dirty input" value=""></td></td>
            <td><input type="text" class="timestamp input" value=""></td></td>
            <td><button class="remove-row">−</button></td>
        `;

        // Set data into row
        row.querySelector(".first-name").value = firstName;
        row.querySelector(".last-name").value = lastName;
        row.querySelector(".reason").value = reason;
        row.querySelector(".status").value = status;
        row.querySelector(".dirty").value = dirty;
        row.querySelector(".timestamp").value = timestamp;
        //
        tableBody.appendChild(row);

        // Add event listener for removing rows
        row.querySelector(".remove-row").addEventListener("click", () => {
            let rmPerson = new Person(firstName, lastName, reason, status, dirty, timestamp)
            peopleManager.realRemove(rmPerson);
            row.remove();
        });
    }

    // Save table data to storage
    async function savePeople() {
        console.log(peopleManager.people);
        await peopleManager.saveToStorage();
    }


    // Start search when button is clicked
    saveButton.addEventListener("click", async () => {
        browser.tabs.query({ active: true, currentWindow: true }).then(async (tabs) => {
            peopleManager.reset();
            if (tabs.length > 0) {
                document.querySelectorAll("#table-body tr").forEach(row => {
                    let firstName = row.querySelector(".first-name").value.trim();
                    let lastName = row.querySelector(".last-name").value.trim();
                    let reason = row.querySelector(".reason").value.trim();
                    let status = row.querySelector(".status").value;
                    let dirty = parseInt(row.querySelector(".dirty").value);
                    let timestamp = parseInt(row.querySelector(".timestamp").value);
                    
                    let newPerson = new Person(firstName, lastName, reason, status, dirty, timestamp);
                    peopleManager.add(newPerson);
                });

                await savePeople();
            }
        });
    });

    saveConfigButton.addEventListener("click", async() => { await saveConfig() });
});
