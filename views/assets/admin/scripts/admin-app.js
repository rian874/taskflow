import Users from "../../_common/classes/Users.js";
import Faqs from "../../_common/classes/Faqs.js";
import FaqCategories from "../../_common/classes/FaqCategories.js";
import SessionStorage from "../../_common/scripts/storage.js";
import { createToast } from "../../_common/prototypes/toast.js";
import Faq from "../../_common/models/Faq.js";
import FaqCategory from "../../_common/models/FaqCategory.js";

class AdminApp {
    storage;
    users;
    faqs;
    categories;
    toast;
    faqData;
    categoryData;
    currentSection;
    faqSearch;
    faqCategoryFilter;
    categorySearch;

    constructor() {
        this.storage = new SessionStorage("admin");
        this.users = new Users();
        this.faqs = new Faqs();
        this.categories = new FaqCategories();
        this.toast = createToast("admin-toast-container");

        this.faqData = [];
        this.categoryData = [];
        this.currentSection = "dashboard";
        this.faqSearch = "";
        this.faqCategoryFilter = "";
        this.categorySearch = "";
    }

    init() {
        this.bindLogin();
        this.bindNavigation();
        this.bindMenu();
        this.bindLogout();
        this.bindFaqActions();
        this.bindCategoryActions();

        const token = this.storage.getToken();
        const user = this.storage.getUser();

        // Se já houver sessão ativa com privilégio administrativo
        if (token && Number(user?.type_id ?? user?.typeId) === 1) {
            this.openPanel();
        } else {
            this.showLogin();
        }

        this.refreshIcons();
    }

    bindLogin() {
        const form = document.querySelector("#admin-login-form");
        if (!form) return;

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const submitBtn = form.querySelector("[type='submit']");
            this.setBusy(submitBtn, true, "Verificando credenciais...");
            this.setFeedback("[data-admin-login-feedback]", "");

            const email = form.elements.email.value.trim();
            const password = form.elements.password.value;

            try {
                const result = await this.users.login(email, password);
                const token = result?.data?.token;
                const user = result?.data;

                if (result?.status !== "success" || !token) {
                    this.setFeedback(
                        "[data-admin-login-feedback]", 
                        result?.message || "Não foi possível entrar no painel.", 
                        "error"
                    );
                    return;
                }

                // Verifica se o usuário tem privilégio de Administrador (type_id = 1)
                if (Number(user?.type_id ?? user?.typeId) !== 1) {
                    this.setFeedback(
                        "[data-admin-login-feedback]", 
                        "Acesso negado: sua conta não possui privilégios de administrador.", 
                        "error"
                    );
                    return;
                }

                this.storage.saveSession(token, user);
                this.openPanel();
            } catch (error) {
                this.setFeedback("[data-admin-login-feedback]", error.message, "error");
            } finally {
                this.setBusy(submitBtn, false, "Entrar no painel");
            }
        });
    }

    bindNavigation() {
        document.querySelectorAll("[data-admin-section]").forEach((button) => {
            button.addEventListener("click", () => {
                this.showSection(button.dataset.adminSection);
                this.closeMenu();
            });
        });
    }

    bindMenu() {
        document.querySelector("[data-admin-menu]")?.addEventListener("click", (event) => {
            const isOpen = document.querySelector("#admin-sidebar").classList.toggle("is-open");
            event.currentTarget.setAttribute("aria-expanded", String(isOpen));
        });
    }

    bindLogout() {
        document.querySelector("[data-admin-logout]")?.addEventListener("click", () => {
            this.storage.clearSession();
            window.location.reload();
        });
    }

    bindFaqActions() {
        // Nova FAQ
        document.querySelector("[data-faq-new]")?.addEventListener("click", () => this.openFaqDialog());

        // Busca
        document.querySelector("[data-faq-search]")?.addEventListener("input", (event) => {
            this.faqSearch = event.target.value.toLocaleLowerCase("pt-BR").trim();
            this.renderFaqs();
        });

        // Filtro por Categoria
        document.querySelector("[data-faq-category-filter]")?.addEventListener("change", (event) => {
            this.faqCategoryFilter = event.target.value;
            this.renderFaqs();
        });

        // Delegação de ações da tabela de FAQs
        document.querySelector("[data-faq-list]")?.addEventListener("click", (event) => {
            const editBtn = event.target.closest("[data-faq-edit]");
            const deleteBtn = event.target.closest("[data-faq-delete]");
            const toggleBtn = event.target.closest("[data-faq-toggle]");

            if (editBtn) {
                this.openFaqDialog(Number(editBtn.dataset.faqEdit));
            } else if (deleteBtn) {
                this.removeFaq(Number(deleteBtn.dataset.faqDelete));
            } else if (toggleBtn) {
                this.toggleFaq(Number(toggleBtn.dataset.faqToggle));
            }
        });

        // Submissão do formulário de FAQ
        document.querySelector("[data-faq-form]")?.addEventListener("submit", (event) => {
            this.saveFaq(event);
        });

        // Fechamento de modal
        document.querySelector("#faq-dialog .admin-dialog__close")?.addEventListener("click", () => {
            document.querySelector("#faq-dialog").close();
        });
        document.querySelector("#faq-dialog [data-dialog-cancel]")?.addEventListener("click", () => {
            document.querySelector("#faq-dialog").close();
        });
    }

    bindCategoryActions() {
        // Nova Categoria
        document.querySelector("[data-category-new]")?.addEventListener("click", () => this.openCategoryDialog());

        // Busca
        document.querySelector("[data-category-search]")?.addEventListener("input", (event) => {
            this.categorySearch = event.target.value.toLocaleLowerCase("pt-BR").trim();
            this.renderCategories();
        });

        // Delegação de ações da tabela de Categorias
        document.querySelector("[data-category-list]")?.addEventListener("click", (event) => {
            const editBtn = event.target.closest("[data-category-edit]");
            const deleteBtn = event.target.closest("[data-category-delete]");

            if (editBtn) {
                this.openCategoryDialog(Number(editBtn.dataset.categoryEdit));
            } else if (deleteBtn) {
                this.removeCategory(Number(deleteBtn.dataset.categoryDelete));
            }
        });

        // Submissão do formulário de Categoria
        document.querySelector("[data-category-form]")?.addEventListener("submit", (event) => {
            this.saveCategory(event);
        });

        // Fechamento de modal
        document.querySelector("#category-dialog .admin-dialog__close")?.addEventListener("click", () => {
            document.querySelector("#category-dialog").close();
        });
        document.querySelector("#category-dialog [data-dialog-cancel]")?.addEventListener("click", () => {
            document.querySelector("#category-dialog").close();
        });
    }

    openPanel() {
        document.querySelector("#admin-login-view").hidden = true;
        document.querySelector("#admin-app-view").hidden = false;
        this.renderAdminUser();
        this.configureClients();
        this.loadContent();
    }

    showLogin() {
        document.querySelector("#admin-login-view").hidden = false;
        document.querySelector("#admin-app-view").hidden = true;
    }

    configureClients() {
        const token = this.storage.getToken();
        if (token) {
            this.faqs.setAuthToken(token);
            this.categories.setAuthToken(token);
            this.users.setAuthToken(token);
        }
    }

    async loadContent() {
        try {
            // Carrega FAQs e Categorias em paralelo
            const [faqResult, categoryResult] = await Promise.allSettled([
                this.faqs.listAllAdmin(),
                this.categories.listAll()
            ]);

            // Trata resultado de FAQs (se rota admin exigir token e falhar, tenta listAll normal)
            if (faqResult.status === "fulfilled" && faqResult.value?.data) {
                this.faqData = faqResult.value.data;
            } else {
                const fallbackFaqs = await this.faqs.listAll();
                this.faqData = fallbackFaqs?.data || [];
            }

            // Trata resultado de Categorias
            if (categoryResult.status === "fulfilled" && categoryResult.value?.data) {
                this.categoryData = categoryResult.value.data;
            } else {
                this.categoryData = [];
            }

            this.populateCategorySelect();
            this.populateFaqCategoryFilter();
            this.renderFaqs();
            this.renderCategories();
            this.renderDashboardMetrics();
        } catch (error) {
            this.setFeedback("[data-faq-feedback]", "Erro ao sincronizar dados com o servidor.", "error");
        }
    }

    showSection(section) {
        this.currentSection = section;

        document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
            panel.hidden = panel.dataset.adminPanel !== section;
        });

        document.querySelectorAll("[data-admin-section]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.adminSection === section);
        });

        const titles = {
            dashboard: "Visão Geral",
            faqs: "Perguntas Frequentes (FAQs)",
            categories: "Categorias de FAQ"
        };
        const titleElem = document.querySelector("[data-admin-page-title]");
        if (titleElem) {
            titleElem.textContent = titles[section] || "Administração";
        }
    }

    renderAdminUser() {
        const user = this.storage.getUser() || { name: "Administrador TaskFlow" };
        const nameParts = user.name.split(" ").filter(Boolean);
        const initials = nameParts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();

        const nameElem = document.querySelector("[data-admin-user-name]");
        const initialsElem = document.querySelector("[data-admin-initials]");
        if (nameElem) nameElem.textContent = user.name;
        if (initialsElem) initialsElem.textContent = initials || "AD";
    }

    renderDashboardMetrics() {
        const totalFaqs = this.faqData.length;
        const activeFaqs = this.faqData.filter((f) => Number(f.active) === 1).length;
        const inactiveFaqs = totalFaqs - activeFaqs;
        const totalCategories = this.categoryData.length;

        const metricsContainer = document.querySelector("[data-admin-metrics]");
        if (!metricsContainer) return;

        metricsContainer.innerHTML = `
            <article class="admin-card">
                <div class="admin-metric__header">
                    <span class="admin-metric__label">Total de FAQs</span>
                    <span class="admin-metric__icon"><i data-lucide="message-circle-question"></i></span>
                </div>
                <strong class="admin-metric__value">${totalFaqs}</strong>
                <small class="admin-metric__change"><i data-lucide="check-circle-2"></i> ${activeFaqs} ativas na área pública</small>
            </article>

            <article class="admin-card">
                <div class="admin-metric__header">
                    <span class="admin-metric__label">Categorias Cadastradas</span>
                    <span class="admin-metric__icon"><i data-lucide="folders"></i></span>
                </div>
                <strong class="admin-metric__value">${totalCategories}</strong>
                <small class="admin-metric__change" style="color: var(--admin-primary);"><i data-lucide="layers"></i> Tópicos organizados</small>
            </article>

            <article class="admin-card">
                <div class="admin-metric__header">
                    <span class="admin-metric__label">FAQs Inativas</span>
                    <span class="admin-metric__icon" style="background: #F1F5F9; color: var(--admin-muted);"><i data-lucide="eye-off"></i></span>
                </div>
                <strong class="admin-metric__value" style="color: ${inactiveFaqs > 0 ? 'var(--admin-amber)' : 'var(--admin-muted)'}">${inactiveFaqs}</strong>
                <small class="admin-metric__change" style="color: var(--admin-muted);"><i data-lucide="info"></i> Ocultas para visitantes</small>
            </article>

            <article class="admin-card">
                <div class="admin-metric__header">
                    <span class="admin-metric__label">Taxa de Disponibilidade</span>
                    <span class="admin-metric__icon"><i data-lucide="activity"></i></span>
                </div>
                <strong class="admin-metric__value">${totalFaqs > 0 ? Math.round((activeFaqs / totalFaqs) * 100) : 100}%</strong>
                <small class="admin-metric__change"><i data-lucide="shield-check"></i> Conteúdo disponível</small>
            </article>
        `;

        this.refreshIcons();
    }

    renderFaqs() {
        const list = document.querySelector("[data-faq-list]");
        if (!list) return;

        const filtered = this.faqData.filter((faq) => {
            const q = (faq.question || "").toLocaleLowerCase("pt-BR");
            const a = (faq.answer || "").toLocaleLowerCase("pt-BR");
            const matchesSearch = !this.faqSearch || q.includes(this.faqSearch) || a.includes(this.faqSearch);
            const matchesCategory = !this.faqCategoryFilter || String(faq.faqs_category_id) === this.faqCategoryFilter;
            return matchesSearch && matchesCategory;
        });

        const countElem = document.querySelector("[data-faq-count]");
        if (countElem) {
            countElem.textContent = `${filtered.length} pergunta(s) encontrada(s)`;
        }

        if (!filtered.length) {
            list.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 48px 16px; color: var(--admin-muted);">
                        <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 6px;">Nenhuma pergunta encontrada</div>
                        <p style="font-size: 0.85rem;">Tente ajustar sua busca ou filtro, ou cadastre uma nova pergunta frequente.</p>
                    </td>
                </tr>
            `;
            return;
        }

        list.innerHTML = filtered.map((faq) => {
            const active = Number(faq.active) === 1;
            const categoryTitle = this.categoryName(faq.faqs_category_id);

            return `
                <tr>
                    <td>
                        <div class="faq-title">${this.escapeHtml(faq.question)}</div>
                        <div class="faq-answer-snippet" title="${this.escapeHtml(faq.answer)}">
                            ${this.escapeHtml(faq.answer)}
                        </div>
                    </td>
                    <td>
                        <span class="admin-badge">
                            <i data-lucide="folder" style="width: 12px; height: 12px;"></i>
                            ${this.escapeHtml(categoryTitle)}
                        </span>
                    </td>
                    <td>
                        <button 
                            class="admin-status-toggle ${active ? "is-active" : "is-inactive"}" 
                            type="button" 
                            data-faq-toggle="${faq.id}" 
                            aria-pressed="${active}" 
                            title="${active ? "Clique para inativar" : "Clique para ativar"}">
                            <span class="admin-status-toggle__track">
                                <span class="admin-status-toggle__thumb"></span>
                            </span>
                            <span>${active ? "Ativa" : "Inativa"}</span>
                        </button>
                    </td>
                    <td>
                        <div class="admin-table__actions">
                            <button 
                                class="admin-table__action" 
                                type="button" 
                                data-faq-edit="${faq.id}" 
                                aria-label="Editar FAQ"
                                title="Editar pergunta">
                                <i data-lucide="pencil" aria-hidden="true"></i>
                            </button>
                            <button 
                                class="admin-table__action admin-table__action--delete" 
                                type="button" 
                                data-faq-delete="${faq.id}" 
                                aria-label="Excluir FAQ"
                                title="Desativar/Excluir pergunta">
                                <i data-lucide="trash-2" aria-hidden="true"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        this.refreshIcons();
    }

    async toggleFaq(id) {
        const faq = this.faqData.find((item) => Number(item.id) === id);
        if (!faq) return;

        const nextActive = Number(faq.active) === 1 ? 0 : 1;
        this.setFeedback("[data-faq-feedback]", "Atualizando status...", "");

        try {
            const result = await this.faqs.update(id, { active: nextActive });
            if (result?.status === "success") {
                faq.active = nextActive;
                this.renderFaqs();
                this.renderDashboardMetrics();
                this.setFeedback("[data-faq-feedback]", nextActive ? "Pergunta ativada com sucesso!" : "Pergunta desativada com sucesso!", "success");
            } else {
                this.setFeedback("[data-faq-feedback]", result?.message || "Não foi possível atualizar o status da FAQ.", "error");
            }
        } catch (error) {
            this.setFeedback("[data-faq-feedback]", error.message, "error");
        }
    }

    openFaqDialog(id = null) {
        const dialog = document.querySelector("#faq-dialog");
        const form = document.querySelector("[data-faq-form]");
        if (!dialog || !form) return;

        form.reset();
        form.elements.id.value = id || "";

        const faq = id ? this.faqData.find((item) => Number(item.id) === Number(id)) : null;

        const titleElem = document.querySelector("[data-faq-dialog-title]");
        const btnElem = document.querySelector("[data-faq-save]");

        if (faq) {
            if (titleElem) titleElem.textContent = "Editar Pergunta Frequente";
            if (btnElem) btnElem.textContent = "Atualizar Pergunta";
            form.elements.question.value = faq.question || "";
            form.elements.answer.value = faq.answer || "";
            this.populateCategorySelect(faq.faqs_category_id);
        } else {
            if (titleElem) titleElem.textContent = "Nova Pergunta Frequente";
            if (btnElem) btnElem.textContent = "Salvar Pergunta";
            this.populateCategorySelect();
        }

        dialog.showModal();
        this.refreshIcons();
    }

    async saveFaq(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const saveBtn = form.querySelector("[data-faq-save]");
        const id = form.elements.id.value ? Number(form.elements.id.value) : null;

        const data = {
            faqs_category_id: form.elements.faqs_category_id.value,
            question: form.elements.question.value.trim(),
            answer: form.elements.answer.value.trim()
        };

        if (!data.faqs_category_id) {
            this.toast.warning("Selecione uma categoria válida para a FAQ.");
            return;
        }

        this.setBusy(saveBtn, true, "Salvando...");

        try {
            const faqEntity = new Faq({
                id,
                faqs_category_id: data.faqs_category_id,
                question: data.question,
                answer: data.answer
            });

            const result = id 
                ? await this.faqs.update(id, faqEntity.toJSON()) 
                : await this.faqs.insert(faqEntity.toJSON());

            if (result?.status === "success" || result?.status === "created") {
                document.querySelector("#faq-dialog").close();
                await this.loadContent();
                this.setFeedback(
                    "[data-faq-feedback]", 
                    id ? "FAQ atualizada com sucesso!" : "Nova FAQ cadastrada com sucesso!", 
                    "success"
                );
            } else {
                this.toast.error(result?.message || "Erro ao salvar pergunta frequente.");
            }
        } catch (error) {
            this.toast.error(`Erro na requisição: ${error.message}`);
        } finally {
            this.setBusy(saveBtn, false, id ? "Atualizar Pergunta" : "Salvar Pergunta");
        }
    }

    async removeFaq(id) {
        const faq = this.faqData.find((item) => Number(item.id) === id);
        const name = faq?.question ? `"${faq.question}"` : "esta pergunta";

        if (!window.confirm(`Deseja realmente remover/desativar ${name}?`)) {
            return;
        }

        try {
            const result = await this.faqs.remove(id);
            if (result?.status === "success") {
                await this.loadContent();
                this.setFeedback("[data-faq-feedback]", "FAQ removida/inativada com sucesso!", "success");
            } else {
                this.setFeedback("[data-faq-feedback]", result?.message || "Não foi possível remover a FAQ.", "error");
            }
        } catch (error) {
            this.setFeedback("[data-faq-feedback]", error.message, "error");
        }
    }

    renderCategories() {
        const list = document.querySelector("[data-category-list]");
        if (!list) return;

        const filtered = this.categoryData.filter((category) => {
            return !this.categorySearch || (category.name || "").toLocaleLowerCase("pt-BR").includes(this.categorySearch);
        });

        const countElem = document.querySelector("[data-category-count]");
        if (countElem) {
            countElem.textContent = `${filtered.length} categoria(s)`;
        }

        if (!filtered.length) {
            list.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 32px; color: var(--admin-muted);">Nenhuma categoria encontrada.</td></tr>';
            return;
        }

        list.innerHTML = filtered.map((category) => `
            <tr>
                <td>
                    <strong style="color: var(--admin-navy);">${this.escapeHtml(category.name)}</strong>
                </td>
                <td>
                    <span class="admin-badge" style="background: var(--admin-green-light); color: var(--admin-green);">
                        <i data-lucide="check" style="width: 12px; height: 12px;"></i> Ativa
                    </span>
                </td>
                <td>
                    <div class="admin-table__actions">
                        <button 
                            class="admin-table__action" 
                            type="button" 
                            data-category-edit="${category.id}" 
                            aria-label="Editar categoria"
                            title="Editar categoria">
                            <i data-lucide="pencil" aria-hidden="true"></i>
                        </button>
                        <button 
                            class="admin-table__action admin-table__action--delete" 
                            type="button" 
                            data-category-delete="${category.id}" 
                            aria-label="Excluir categoria"
                            title="Excluir categoria">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        this.refreshIcons();
    }

    openCategoryDialog(id = null) {
        const dialog = document.querySelector("#category-dialog");
        const form = document.querySelector("[data-category-form]");
        if (!dialog || !form) return;

        form.reset();
        form.elements.id.value = id || "";

        const category = id ? this.categoryData.find((item) => Number(item.id) === Number(id)) : null;
        const titleElem = document.querySelector("[data-category-dialog-title]");
        const btnElem = document.querySelector("[data-category-save]");

        if (category) {
            if (titleElem) titleElem.textContent = "Editar Categoria";
            if (btnElem) btnElem.textContent = "Atualizar Categoria";
            form.elements.name.value = category.name || "";
        } else {
            if (titleElem) titleElem.textContent = "Nova Categoria";
            if (btnElem) btnElem.textContent = "Salvar Categoria";
        }

        dialog.showModal();
        this.refreshIcons();
    }

    async saveCategory(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const saveBtn = form.querySelector("[data-category-save]");
        const id = form.elements.id.value ? Number(form.elements.id.value) : null;
        const data = { name: form.elements.name.value.trim() };

        if (!data.name) {
            this.toast.warning("Informe o nome da categoria.");
            return;
        }

        this.setBusy(saveBtn, true, "Salvando...");

        try {
            const catEntity = new FaqCategory({ id, name: data.name });
            const result = id 
                ? await this.categories.update(id, catEntity.toJSON()) 
                : await this.categories.insert(catEntity.toJSON());

            if (result?.status === "success" || result?.status === "created") {
                document.querySelector("#category-dialog").close();
                await this.loadContent();
                this.setFeedback(
                    "[data-category-feedback]", 
                    id ? "Categoria atualizada!" : "Categoria cadastrada!", 
                    "success"
                );
            } else {
                this.toast.error(result?.message || "Erro ao salvar categoria.");
            }
        } catch (error) {
            this.toast.error(`Erro: ${error.message}`);
        } finally {
            this.setBusy(saveBtn, false, id ? "Atualizar Categoria" : "Salvar Categoria");
        }
    }

    async removeCategory(id) {
        const category = this.categoryData.find((item) => Number(item.id) === id);
        const name = category?.name ? `"${category.name}"` : "esta categoria";

        if (!window.confirm(`Deseja realmente remover ${name}?`)) {
            return;
        }

        try {
            const result = await this.categories.remove(id);
            if (result?.status === "success") {
                await this.loadContent();
                this.setFeedback("[data-category-feedback]", "Categoria removida com sucesso!", "success");
            } else {
                this.setFeedback("[data-category-feedback]", result?.message || "Não foi possível remover a categoria.", "error");
            }
        } catch (error) {
            this.setFeedback("[data-category-feedback]", error.message, "error");
        }
    }

    populateCategorySelect(selectedId = "") {
        const select = document.querySelector("#faq-category");
        if (!select) return;

        select.innerHTML = '<option value="">Selecione uma categoria...</option>' + 
            this.categoryData.map((cat) => `
                <option value="${cat.id}" ${String(cat.id) === String(selectedId) ? "selected" : ""}>
                    ${this.escapeHtml(cat.name)}
                </option>
            `).join("");
    }

    populateFaqCategoryFilter() {
        const select = document.querySelector("[data-faq-category-filter]");
        if (!select) return;

        select.innerHTML = '<option value="">Todas as categorias</option>' + 
            this.categoryData.map((cat) => `
                <option value="${cat.id}" ${String(cat.id) === this.faqCategoryFilter ? "selected" : ""}>
                    ${this.escapeHtml(cat.name)}
                </option>
            `).join("");
    }

    categoryName(id) {
        return this.categoryData.find((cat) => Number(cat.id) === Number(id))?.name || "Geral";
    }

    setBusy(button, busy, text = "") {
        if (!button) return;
        button.disabled = busy;
        if (text) button.textContent = text;
    }

    setFeedback(selector, message, type = "") {
        const elem = document.querySelector(selector);
        if (elem) {
            elem.textContent = message;
            elem.className = `admin-feedback${type ? ` is-${type}` : ""}`;

            // Auto limpa mensagens de sucesso após 5 segundos
            if (type === "success") {
                setTimeout(() => {
                    if (elem.textContent === message) {
                        elem.textContent = "";
                        elem.className = "admin-feedback";
                    }
                }, 5000);
            }
        }

        if (message) {
            if (type === "success") {
                this.toast.success(message);
            } else if (type === "error") {
                this.toast.error(message);
            }
        }
    }

    closeMenu() {
        document.querySelector("#admin-sidebar")?.classList.remove("is-open");
        document.querySelector("[data-admin-menu]")?.setAttribute("aria-expanded", "false");
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }

    escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const app = new AdminApp();
    app.init();
});
