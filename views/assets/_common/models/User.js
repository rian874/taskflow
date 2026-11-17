export default class User {
    #id;
    #typeId;
    #name;
    #email;
    #photo;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.typeId = data.typeId ?? data.type_id ?? 2;
        this.name = data.name ?? "";
        this.email = data.email ?? "";
        this.photo = data.photo ?? null;
        this.active = data.active ?? 1;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value ? Number(value) : null;
    }

    get typeId() {
        return this.#typeId;
    }

    set typeId(value) {
        this.#typeId = Number(value) === 1 ? 1 : 2;
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

    get email() {
        return this.#email;
    }

    set email(value) {
        if (!value || typeof value !== "string" || !value.includes("@")) {
            throw new TypeError("E-mail inválido");
        }
        this.#email = value.trim().toLowerCase();
    }

    get photo() {
        return this.#photo;
    }

    set photo(value) {
        this.#photo = value || null;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value) === 0 ? 0 : 1;
    }

    isAdmin() {
        return this.#typeId === 1;
    }

    getFirstName() {
        return (this.#name || "Usuário").split(" ")[0];
    }

    getInitials() {
        if (!this.#name) return "US";
        const parts = this.#name.split(" ").filter(Boolean);
        return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
    }

    toJSON() {
        return {
            id: this.id,
            type_id: this.typeId,
            name: this.name,
            email: this.email,
            photo: this.photo,
            active: this.active
        };
    }

    static fromJSON(data) {
        return new User(data);
    }
}
