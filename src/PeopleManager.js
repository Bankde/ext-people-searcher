class PeopleManager {
    constructor() {
        if (PeopleManager.instance) {
            return PeopleManager.instance;
        }

        this.people = {};  // { "First Last": Person }

        PeopleManager.instance = this;
    }

    add(person) {
        let key = person._makeKey();
        this.people[key] = person;
    }

    remove(person) {
        person.setStatus(Person.Status.DELETED);
        let key = person._makeKey();
        this.people[key] = person;
    }

    realRemove(person) {
        let key = person._makeKey();
        delete this.people[key];
    }

    reset() {
        console.log("Reset PeopleManager data");
        this.people = {};
    }

    get(key) {
        return this.people[key] || null;
    }

    getAll() {
        return Object.values(this.people);
    }

    toJSON() {
        const obj = {};
        for (const [key, person] of Object.entries(this.people)) {
            obj[key] = person.toJSON();
        }
        return obj;
    }

    fromJSONObject(obj) {
        this.people = {};
        for (const [key, val] of Object.entries(obj)) {
            this.people[key] = Person.fromJSON(val);
        }
    }

    async loadFromStorage() {
        const { people = {} } = await browser.storage.local.get("people");
        this.fromJSONObject(people);
    }

    async saveToStorage() {
        await browser.storage.local.set({ people: this.toJSON() });
    }
}