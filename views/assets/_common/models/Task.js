export default class Task {
    #id;
    #userId;
    #title;
    #description;
    #priority;
    #dueDate;
    #statusId;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.userId = data.userId ?? data.user_id ?? null;
        this.title = data.title ?? "";
        this.description = data.description ?? "";
        this.priority = data.priority ?? "Média";
        this.dueDate = data.dueDate ?? data.due_date ?? null;
        this.statusId = data.statusId ?? data.status_id ?? 1;
        this.active = data.active ?? 1;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value ? Number(value) : null;
    }

    get userId() {
        return this.#userId;
    }

    set userId(value) {
        this.#userId = value ? Number(value) : null;
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        if (!value || typeof value !== "string" || !value.trim()) {
            throw new TypeError("O título é obrigatório");
        }
        this.#title = value.trim();
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = value ? String(value).trim() : "";
    }

    get priority() {
        return this.#priority;
    }

    set priority(value) {
        const valid = ["Alta", "Média", "Baixa"];
        this.#priority = valid.includes(value) ? value : "Média";
    }

    get dueDate() {
        return this.#dueDate;
    }

    set dueDate(value) {
        this.#dueDate = value ? String(value).split("T")[0] : null;
    }

    get statusId() {
        return this.#statusId;
    }

    set statusId(value) {
        this.#statusId = Number(value) === 2 ? 2 : 1;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value) === 0 ? 0 : 1;
    }

    isCompleted() {
        return this.#statusId === 2;
    }

    toggleStatus() {
        this.#statusId = this.isCompleted() ? 1 : 2;
        return this.#statusId;
    }

    isOverdue() {
        if (this.isCompleted() || !this.#dueDate) return false;
        const today = new Date().toISOString().split("T")[0];
        return this.#dueDate < today;
    }

    getFormattedDueDate() {
        if (!this.#dueDate) return "Sem prazo";
        const parts = this.#dueDate.split("-");
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : this.#dueDate;
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.userId,
            title: this.title,
            description: this.description,
            priority: this.priority,
            due_date: this.dueDate,
            status_id: this.statusId,
            active: this.active
        };
    }

    static fromJSON(data) {
        return new Task(data);
    }
}
