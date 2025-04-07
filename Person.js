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
        if (!Object.values(Person.Status).includes(status)) {
            throw new Error(`Invalid Status: ${status}`);
        }
        this.status = status;
    }

    _makeKey() {
        return `${this.firstName} ${this.lastName}`;
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