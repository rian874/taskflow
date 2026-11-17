export default class TaskImage {
    #id;
    #taskId;
    #imagePath;
    #url;
    #altText;
    #position;
    #createdAt;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.taskId = data.taskId ?? data.task_id ?? null;
        this.imagePath = data.imagePath ?? data.image_path ?? "";
        this.url = data.url ?? data.image_path ?? "";
        this.altText = data.altText ?? data.alt_text ?? "";
        this.position = data.position ?? 0;
        this.createdAt = data.createdAt ?? data.created_at ?? null;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value !== null && value !== undefined && value !== "" ? Number(value) : null;
    }

    get taskId() {
        return this.#taskId;
    }

    set taskId(value) {
        const number = Number(value);
        if (!Number.isInteger(number) || number <= 0) {
            throw new TypeError("O identificador da tarefa (task_id) é obrigatório");
        }
        this.#taskId = number;
    }

    get imagePath() {
        return this.#imagePath;
    }

    set imagePath(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O caminho da imagem é obrigatório");
        }
        this.#imagePath = value.trim();
    }

    get url() {
        return this.#url;
    }

    set url(value) {
        this.#url = value ? String(value).trim() : "";
    }

    get altText() {
        return this.#altText;
    }

    set altText(value) {
        this.#altText = value ? String(value).trim() : "";
    }

    get position() {
        return this.#position;
    }

    set position(value) {
        const number = Number(value);
        this.#position = Number.isFinite(number) && number >= 0 ? number : 0;
    }

    get createdAt() {
        return this.#createdAt;
    }

    set createdAt(value) {
        this.#createdAt = value ? String(value) : null;
    }

    toJSON() {
        return {
            id: this.id,
            task_id: this.taskId,
            image_path: this.imagePath,
            url: this.url,
            alt_text: this.altText,
            position: this.position,
            created_at: this.createdAt
        };
    }

    static fromJSON(data) {
        return new TaskImage(data);
    }
}
