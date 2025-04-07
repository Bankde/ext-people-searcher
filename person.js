class Person {
    constructor(firstName = "", lastName = "", reason = "", status = this.Status.CREATED, dirty = 0, timestamp=-1) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.reason = reason;
        this.status = status;
        this.dirty = dirty;
        this.timestamp = timestamp;
    }

    static Status = Object.freeze({
        CREATED: "C",
        DELETED: "D"
    });

    setStatus(status) {
        if (!Status.values().includes(status)) {
            throw new Error(`Invalid Status: ${reason}`);
        }
        this.status = status;
    }

    _makeKey() {
        return `${this.firstName} ${this.lastName}`;
    }

    toRowElement() {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><input type="text" class="first-name" value="${this.firstName}"></td>
            <td><input type="text" class="last-name" value="${this.lastName}"></td>
            <td><input type="text" class="reason" value="${this.reason}"></td>
            <td><button class="remove-row">−</button></td>
        `;

        // Add remove listener and input change save
        tr.querySelector(".remove-row").addEventListener("click", () => {
            tr.remove();
            savePeople();
        });

        tr.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", savePeople);
        });

        return tr;
    }

    static fromJSON(json) {
        return new Person(json.firstName, json.lastName, json.reason, json.status, json.dirty, json.timestamp);
    }

    toJSON() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            reason: this.reason,
            status: this.status,
            dirty: this.dirty,
            timestamp: this.timestamp
        };
    }
}