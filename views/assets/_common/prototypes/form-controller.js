export const FormControllerPrototype = {
    init(formOrSelector) {
        this.form = typeof formOrSelector === "string" 
            ? document.querySelector(formOrSelector) 
            : formOrSelector;
        this.submitButton = this.form?.querySelector("[type='submit']") || null;
        this.defaultButtonText = this.submitButton?.innerHTML || "";
        this.errorElements = new Map();
        return this;
    },

    serialize() {
        if (!this.form) return {};
        const formData = new FormData(this.form);
        const data = {};

        formData.forEach((value, key) => {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(typeof value === "string" ? value.trim() : value);
            } else {
                data[key] = typeof value === "string" ? value.trim() : value;
            }
        });

        return data;
    },

    toFormData() {
        return this.form ? new FormData(this.form) : new FormData();
    },

    populate(data = {}) {
        if (!this.form || !data) return;

        Object.entries(data).forEach(([key, value]) => {
            const field = this.form.elements.namedItem(key);
            if (!field) return;

            if (field instanceof RadioNodeList) {
                field.value = String(value ?? "");
            } else if (field.type === "checkbox") {
                field.checked = Boolean(value);
            } else if (field.type === "date" && value) {
                field.value = String(value).split("T")[0];
            } else {
                field.value = value ?? "";
            }
        });
    },

    reset() {
        if (!this.form) return;
        this.form.reset();
        this.clearErrors();
        const hiddenId = this.form.querySelector("input[type='hidden'][name='id']");
        if (hiddenId) hiddenId.value = "";
    },

    validate(rules = {}) {
        this.clearErrors();
        const data = this.serialize();
        const errors = {};

        Object.entries(rules).forEach(([fieldName, rule]) => {
            const val = data[fieldName];
            const label = rule.label || fieldName;

            if (rule.required && (!val || String(val).trim() === "")) {
                errors[fieldName] = `O campo ${label} é obrigatório`;
                this.showFieldError(fieldName, errors[fieldName]);
                return;
            }

            if (rule.minLength && val && String(val).length < rule.minLength) {
                errors[fieldName] = `O campo ${label} deve ter no mínimo ${rule.minLength} caracteres`;
                this.showFieldError(fieldName, errors[fieldName]);
                return;
            }

            if (rule.email && val) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(String(val))) {
                    errors[fieldName] = `Informe um ${label} válido`;
                    this.showFieldError(fieldName, errors[fieldName]);
                    return;
                }
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    showFieldError(fieldName, message) {
        if (!this.form) return;
        const field = this.form.elements.namedItem(fieldName);
        if (!field) return;

        field.classList.add("has-error");
        let errorEl = this.errorElements.get(fieldName);

        if (!errorEl) {
            errorEl = document.createElement("span");
            errorEl.className = "tf-field-error";
            field.parentNode.appendChild(errorEl);
            this.errorElements.set(fieldName, errorEl);
        }

        errorEl.textContent = message;
    },

    clearErrors() {
        this.errorElements.forEach((el, fieldName) => {
            el.remove();
            const field = this.form?.elements.namedItem(fieldName);
            if (field) field.classList.remove("has-error");
        });
        this.errorElements.clear();
    },

    setBusy(isBusy, busyText = "Salvando...") {
        if (!this.submitButton) return;

        this.submitButton.disabled = isBusy;
        if (isBusy) {
            this.submitButton.innerHTML = `<span class="tf-btn-spinner"></span> ${busyText}`;
        } else {
            this.submitButton.innerHTML = this.defaultButtonText;
        }
    }
};

export function createFormController(formOrSelector) {
    const controller = Object.create(FormControllerPrototype);
    controller.init(formOrSelector);
    return controller;
}
