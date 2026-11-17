import Users from "../../_common/classes/Users.js";
import SessionStorage from "../../_common/scripts/storage.js";

export default class AuthModal {
    constructor() {
        this.modal = document.querySelector("#auth-modal");
        this.users = new Users();
        this.storage = new SessionStorage();
        this.lastTrigger = null;

        if (!this.modal) {
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll("[data-auth-open]").forEach((trigger) => {
            trigger.addEventListener("click", () => {
                this.lastTrigger = trigger;
                const panel = trigger.dataset.authOpen || "login";
                this.open(panel);
            });
        });

        this.modal.querySelector("[data-auth-close]")?.addEventListener("click", () => {
            this.close();
        });

        this.modal.addEventListener("click", (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });

        this.modal.addEventListener("close", () => {
            this.restoreFocus();
        });

        this.modal.querySelectorAll("[data-auth-tab], [data-auth-tab-trigger]").forEach((trigger) => {
            trigger.addEventListener("click", () => {
                this.showPanel(trigger.dataset.authTab || trigger.dataset.authTabTrigger);
            });
        });

        this.modal.querySelector("#login-form")?.addEventListener("submit", (event) => {
            this.handleLogin(event);
        });

        this.modal.querySelector("#register-form")?.addEventListener("submit", (event) => {
            this.handleRegister(event);
        });

        this.modal.querySelector("#forgot-form")?.addEventListener("submit", (event) => {
            event.preventDefault();
            this.showFeedback("A recuperação de senha estará disponível em breve.", "success");
        });

        // Alternador de visibilidade de senha
        this.modal.querySelectorAll("[data-toggle-password]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetId = btn.dataset.togglePassword;
                const input = this.modal.querySelector(`#${targetId}`);
                if (!input) return;

                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";

                btn.innerHTML = `<i data-lucide="${isPassword ? "eye-off" : "eye"}" style="width: 16px; height: 16px;"></i>`;
                if (typeof lucide !== "undefined") {
                    lucide.createIcons();
                }
            });
        });
    }

    open(initialPanel = "login") {
        this.closeMobileMenu();
        this.showPanel(initialPanel);
        this.clearFeedback();

        if (!this.modal.open) {
            this.modal.showModal();
        }

        window.requestAnimationFrame(() => {
            const activePanel = this.modal.querySelector(".auth-panel.is-active");
            activePanel?.querySelector("input")?.focus();
        });
    }

    close() {
        if (this.modal.open) {
            this.modal.close();
        }
    }

    showPanel(panelName) {
        const panel = panelName || "login";

        this.modal.querySelectorAll("[data-auth-panel]").forEach((section) => {
            const isActive = section.dataset.authPanel === panel;
            section.classList.toggle("is-active", isActive);
            section.hidden = !isActive;
        });

        this.modal.querySelectorAll("[data-auth-tab]").forEach((tab) => {
            const isActive = tab.dataset.authTab === panel;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });

        this.clearFeedback();
    }

    async handleLogin(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const submitButton = form.querySelector("[type='submit']");
        this.setBusy(submitButton, true);
        this.clearFeedback();

        try {
            const result = await this.users.loginFromForm(form);

            if (result?.status !== "success" && result?.type !== "success") {
                this.showFeedback(result?.message || "Não foi possível realizar o login. Verifique seus dados.", "error");
                return;
            }

            const token = result.data?.token;
            if (!token) {
                this.showFeedback("O servidor não retornou uma sessão válida.", "error");
                return;
            }

            this.storage.saveSession(token, result.data);
            this.showFeedback("Login realizado com sucesso! Redirecionando...", "success");

            setTimeout(() => {
                window.location.href = "app/index.html";
            }, 600);
        } catch (error) {
            this.showFeedback(error.message || "Erro de conexão com o servidor.", "error");
        } finally {
            this.setBusy(submitButton, false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const submitButton = form.querySelector("[type='submit']");
        this.setBusy(submitButton, true);
        this.clearFeedback();

        try {
            const formData = new FormData(form);
            const result = await this.users.register(formData);

            if (result?.status !== "created" && result?.status !== "success" && result?.type !== "success") {
                this.showFeedback(result?.message || "Não foi possível criar sua conta. Tente novamente.", "error");
                return;
            }

            const email = form.elements.email.value;
            this.showPanel("login");
            const loginEmailInput = this.modal.querySelector("#login-email");
            if (loginEmailInput) {
                loginEmailInput.value = email;
            }
            this.showFeedback("Conta criada com sucesso! Agora, faça login com sua senha.", "success");
        } catch (error) {
            this.showFeedback(error.message || "Erro de conexão ao cadastrar.", "error");
        } finally {
            this.setBusy(submitButton, false);
        }
    }

    showFeedback(message, type = "") {
        const feedback = this.modal.querySelector("[data-auth-feedback]");
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = `auth-feedback${type ? ` is-${type}` : ""}`;
    }

    clearFeedback() {
        const feedback = this.modal.querySelector("[data-auth-feedback]");
        if (!feedback) return;
        feedback.textContent = "";
        feedback.className = "auth-feedback";
    }

    setBusy(button, isBusy) {
        if (!button) return;

        button.disabled = isBusy;
        button.setAttribute("aria-busy", String(isBusy));
        button.dataset.defaultLabel ??= button.textContent;
        button.textContent = isBusy ? "Processando..." : button.dataset.defaultLabel;
    }

    closeMobileMenu() {
        const mobileMenu = document.querySelector("#mobile-menu");
        if (!mobileMenu?.classList.contains("open")) return;

        mobileMenu.classList.remove("open");
        document.body.style.overflow = "";
        document.querySelector("#mobile-menu-btn")?.setAttribute("aria-expanded", "false");
    }

    restoreFocus() {
        this.lastTrigger?.focus();
        this.lastTrigger = null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AuthModal();
});
