export default class Faq {
    #id;
    #faqsCategoryId;
    #question;
    #answer;
    #active;

    constructor(data = {}) {
        this.id = data.id ?? null;
        this.faqsCategoryId = data.faqsCategoryId ?? data.faqs_category_id ?? null;
        this.question = data.question ?? "";
        this.answer = data.answer ?? "";
        this.active = data.active ?? 1;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value ? Number(value) : null;
    }

    get faqsCategoryId() {
        return this.#faqsCategoryId;
    }

    set faqsCategoryId(value) {
        this.#faqsCategoryId = value ? Number(value) : null;
    }

    get question() {
        return this.#question;
    }

    set question(value) {
        if (!value || typeof value !== "string" || !value.trim()) {
            throw new TypeError("A pergunta é obrigatória");
        }
        this.#question = value.trim();
    }

    get answer() {
        return this.#answer;
    }

    set answer(value) {
        if (!value || typeof value !== "string" || !value.trim()) {
            throw new TypeError("A resposta é obrigatória");
        }
        this.#answer = value.trim();
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

    toggleActive() {
        this.#active = this.isActive() ? 0 : 1;
        return this.#active;
    }

    toJSON() {
        return {
            id: this.id,
            faqs_category_id: this.faqsCategoryId,
            question: this.question,
            answer: this.answer,
            active: this.active
        };
    }

    static fromJSON(data) {
        return new Faq(data);
    }
}
