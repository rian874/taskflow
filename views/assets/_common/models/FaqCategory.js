export default class FaqCategory {
    #id;
    #name;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.name = data.name ?? "";
        this.active = data.active ?? 1;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value ? Number(value) : null;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (!value || typeof value !== "string" || !value.trim()) {
            throw new TypeError("O nome é obrigatório");
        }
        this.#name = value.trim();
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value) === 0 ? 0 : 1;
    }

    isActive() {
        return this.#active === 1;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            active: this.active
        };
    }

    static fromJSON(data) {
        return new FaqCategory(data);
    }
}
