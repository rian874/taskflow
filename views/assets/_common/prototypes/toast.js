export const ToastPrototype = {
    init(containerId = "tf-toast-container") {
        this.containerId = containerId;
        this.container = null;
        this.activeToasts = [];
        return this;
    },

    ensureContainer() {
        if (!this.container || !document.body.contains(this.container)) {
            let existing = document.getElementById(this.containerId);
            if (!existing) {
                existing = document.createElement("div");
                existing.id = this.containerId;
                existing.className = "tf-toast-container";
                document.body.appendChild(existing);
            }
            this.container = existing;
        }
        return this.container;
    },

    show(message, type = "success", duration = 4000) {
        if (!message) return null;
        const container = this.ensureContainer();

        const toast = document.createElement("div");
        toast.className = `tf-toast tf-toast--${type}`;

        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`
        };

        toast.innerHTML = `
            <div class="tf-toast__icon">${icons[type] || icons.success}</div>
            <div class="tf-toast__body">
                <p class="tf-toast__msg">${escapeHtml(message)}</p>
            </div>
            <button type="button" class="tf-toast__close" aria-label="Fechar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        `;

        toast.querySelector(".tf-toast__close").addEventListener("click", () => this.dismiss(toast));
        container.appendChild(toast);
        this.activeToasts.push(toast);

        requestAnimationFrame(() => toast.classList.add("is-visible"));

        if (duration > 0) {
            toast._timeoutId = setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    success(message, duration = 4000) {
        return this.show(message, "success", duration);
    },

    warning(message, duration = 5000) {
        return this.show(message, "warning", duration);
    },

    error(message, duration = 6000) {
        return this.show(message, "error", duration);
    },

    handleApiResponse(response, defaultSuccess = "Operação realizada com sucesso") {
        if (!response) {
            this.error("Sem resposta do servidor");
            return false;
        }

        const isOk = response.status === "success" || response.status === "created" || (response.code >= 200 && response.code < 300);
        const msg = response.message || (isOk ? defaultSuccess : "Erro ao processar");

        if (isOk) {
            this.success(msg);
            return true;
        } else {
            this.error(msg);
            return false;
        }
    },

    dismiss(toastEl) {
        if (!toastEl || toastEl._isDismissing) return;
        toastEl._isDismissing = true;
        if (toastEl._timeoutId) clearTimeout(toastEl._timeoutId);

        toastEl.classList.remove("is-visible");
        toastEl.classList.add("is-hiding");

        setTimeout(() => {
            if (toastEl.parentNode) {
                toastEl.parentNode.removeChild(toastEl);
            }
            this.activeToasts = this.activeToasts.filter((t) => t !== toastEl);
        }, 300);
    }
};

export function createToast(containerId = "tf-toast-container") {
    const toast = Object.create(ToastPrototype);
    toast.init(containerId);
    return toast;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const defaultToast = createToast();
export default defaultToast;
