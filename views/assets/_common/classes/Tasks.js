import HttpClientBase from "./HttpClientBase.js";

export default class Tasks extends HttpClientBase {
    #id;
    #userId;
    #title;
    #description;
    #priority;
    #dueDate;
    #statusId;
    #active;

    constructor(data = {}) {
        super();
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
        this.#title = value ? String(value).trim() : "";
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

    toggleStatusValue() {
        this.#statusId = this.isCompleted() ? 1 : 2;
        return this.#statusId;
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

    async list(params = {}) {
        return this.get("/tasks/list", params);
    }

    async listById(taskId = null) {
        const id = taskId || this.id;
        return this.get("/tasks/list/:taskId", { taskId: id });
    }

    async insert(data = null) {
        const payload = data ? (data.toJSON ? data.toJSON() : data) : this.toJSON();
        return this.post("/tasks", payload);
    }

    async create(data = null) {
        return this.insert(data);
    }

    async update(taskId = null, data = null) {
        const id = taskId || this.id;
        const payload = data ? (data.toJSON ? data.toJSON() : data) : this.toJSON();
        return this.put("/tasks/:taskId", payload, { taskId: id });
    }

    async remove(taskId = null) {
        const id = taskId || this.id;
        return this.delete("/tasks/:taskId", { taskId: id });
    }

    async toggleStatus(taskId = null, currentStatusId = null) {
        const id = taskId || this.id;
        const current = currentStatusId !== null ? currentStatusId : this.statusId;
        const nextStatusId = Number(current) === 2 ? 1 : 2;
        return this.update(id, { status_id: nextStatusId });
    }
}
