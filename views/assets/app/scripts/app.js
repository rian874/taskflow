import AuthGuard from "../../_common/scripts/auth-guard.js";
import SessionStorage from "../../_common/scripts/storage.js";
import Tasks from "../../_common/classes/Tasks.js";
import TaskImages from "../../_common/classes/TaskImages.js";
import Users from "../../_common/classes/Users.js";
import Task from "../../_common/models/Task.js";
import TaskImage from "../../_common/models/TaskImage.js";
import User from "../../_common/models/User.js";
import { createToast } from "../../_common/prototypes/toast.js";
import { createFormController } from "../../_common/prototypes/form-controller.js";

class AppDashboard {
    constructor() {
        this.storage = new SessionStorage();
        this.tasksService = new Tasks();
        this.taskImagesService = new TaskImages();
        this.usersService = new Users();
        this.toast = createToast();

        // Dois objetos instanciados a partir do mesmo protótipo FormControllerPrototype (Etapa 06 - Parte B)
        this.taskFormController = null;
        this.profileFormController = null;

        this.tasksList = [];
        this.activeFilter = "all";
        this.searchTerm = "";
        this.currentPage = "dashboard";

        // Galeria 1:N da tarefa selecionada (Etapa 07 - Parte B)
        this.activeGalleryTaskId = null;
        this.galleryPreviewUrls = [];
        this.profilePhotoObjectUrl = null;

        this.dialog = document.querySelector("#task-dialog");
        this.form = document.querySelector("#task-dialog-form");
        this.profileForm = document.querySelector("#profile-data-form");
        this.profilePhotoForm = document.querySelector("#profile-photo-form");
        this.galleryDialog = document.querySelector("#task-gallery-dialog");
        this.galleryForm = document.querySelector("#task-gallery-form");
    }

    init() {
        this.configureAuth();
        this.initFormControllers();
        this.renderUserFromSession();
        this.bindNavigation();
        this.bindToolbar();
        this.bindDialog();
        this.bindTaskActions();
        this.bindProfile();
        this.bindGallery();
        this.bindLogout();
        this.loadTasks();
        this.loadProfileFromApi();
        this.refreshIcons();
    }

    configureAuth() {
        const token = this.storage.getToken();
        if (token) {
            this.tasksService.setAuthToken(token);
            this.taskImagesService.setAuthToken(token);
            this.usersService.setAuthToken(token);
        }
    }

    initFormControllers() {
        if (this.form) {
            this.taskFormController = createFormController(this.form);
        }
        if (this.profileForm) {
            this.profileFormController = createFormController(this.profileForm);
        }
    }

    renderUserFromSession() {
        const rawUser = this.storage.getUser();
        if (!rawUser) return;

        const userEntity = User.fromJSON(rawUser);
        const name = userEntity.name || "Usuário";
        const firstName = userEntity.getFirstName();
        const initials = userEntity.getInitials();

        document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = name));
        document.querySelectorAll("[data-user-first-name]").forEach((el) => (el.textContent = firstName));
        document.querySelectorAll("[data-user-initials], [data-profile-initials]").forEach((el) => (el.textContent = initials));

        this.updateAvatarElement("[data-user-photo]", "[data-user-initials]", userEntity.photo);
        this.updateAvatarElement("[data-profile-photo]", "[data-profile-initials]", userEntity.photo);
    }

    updateAvatarElement(imgSelector, initialsSelector, photoUrl) {
        const image = document.querySelector(imgSelector);
        const initials = document.querySelector(initialsSelector);
        if (!image || !initials) return;

        const safeUrl = this.getSafePhotoUrl(photoUrl);

        image.hidden = true;
        initials.hidden = false;

        image.onerror = () => {
            image.hidden = true;
            initials.hidden = false;
        };

        image.onload = () => {
            image.hidden = false;
            initials.hidden = true;
        };

        if (safeUrl) {
            image.src = safeUrl;
        } else {
            image.removeAttribute("src");
        }
    }

    getSafePhotoUrl(photo) {
        if (typeof photo !== "string" || photo.trim() === "") {
            return null;
        }
        try {
            const url = new URL(photo, window.location.origin);
            return ["http:", "https:", "blob:"].includes(url.protocol) ? url.href : null;
        } catch {
            return null;
        }
    }

    bindNavigation() {
        document.querySelectorAll("[data-app-page-link]").forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const targetPage = link.dataset.appPageLink || "dashboard";
                this.showPage(targetPage);

                document.querySelectorAll(".app-nav .app-nav__link").forEach((item) => item.classList.remove("is-active"));
                link.classList.add("is-active");

                if (link.dataset.appFilter) {
                    this.setFilter(link.dataset.appFilter);
                }
            });
        });

        document.querySelector("[data-open-profile]")?.addEventListener("click", () => {
            this.showPage("profile");
            document.querySelectorAll(".app-nav .app-nav__link").forEach((item) => {
                item.classList.toggle("is-active", item.dataset.appPageLink === "profile");
            });
        });
    }

    showPage(pageName) {
        this.currentPage = pageName;
        document.querySelectorAll("[data-app-page]").forEach((section) => {
            section.hidden = section.dataset.appPage !== pageName;
        });
    }

    bindToolbar() {
        const searchInput = document.querySelector("#task-search-input");
        searchInput?.addEventListener("input", (event) => {
            this.searchTerm = event.target.value.toLocaleLowerCase("pt-BR").trim();
            this.renderTasks();
        });

        document.querySelectorAll("[data-status-filter]").forEach((tab) => {
            tab.addEventListener("click", () => {
                document.querySelectorAll("[data-status-filter]").forEach((t) => t.classList.remove("is-active"));
                tab.classList.add("is-active");
                this.setFilter(tab.dataset.statusFilter);
            });
        });
    }

    setFilter(filter) {
        this.activeFilter = filter;

        document.querySelectorAll("[data-status-filter]").forEach((t) => {
            t.classList.toggle("is-active", t.dataset.statusFilter === filter);
        });

        document.querySelectorAll("[data-app-filter]").forEach((link) => {
            link.classList.toggle("is-active", link.dataset.appFilter === filter && this.currentPage === "dashboard");
        });

        this.renderTasks();
    }

    bindDialog() {
        document.querySelector("[data-action-new-task]")?.addEventListener("click", () => {
            this.openTaskDialog(null);
        });

        document.querySelectorAll("[data-dialog-close]").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.closeTaskDialog();
            });
        });

        this.form?.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleTaskFormSubmit();
        });
    }

    openTaskDialog(task = null) {
        if (!this.dialog || !this.taskFormController) return;

        this.taskFormController.reset();

        const titleElem = document.querySelector("#task-dialog-title");
        const submitBtn = document.querySelector("#task-submit-btn");

        if (task) {
            if (titleElem) titleElem.textContent = "Editar Tarefa";
            if (submitBtn) submitBtn.textContent = "Salvar Alterações";
            this.taskFormController.populate({
                id: task.id,
                title: task.title,
                description: task.description || "",
                priority: task.priority || "Média",
                due_date: task.dueDate || ""
            });
        } else {
            if (titleElem) titleElem.textContent = "Nova Tarefa";
            if (submitBtn) submitBtn.textContent = "Criar Tarefa";
            this.taskFormController.populate({
                priority: "Média",
                due_date: new Date().toISOString().split("T")[0]
            });
        }

        this.dialog.showModal();
        this.refreshIcons();
    }

    closeTaskDialog() {
        if (this.dialog?.open) {
            this.dialog.close();
            this.taskFormController?.reset();
        }
    }

    async handleTaskFormSubmit() {
        if (!this.taskFormController) return;

        const validation = this.taskFormController.validate({
            title: { required: true, label: "Título da Tarefa", minLength: 3 }
        });

        if (!validation.isValid) {
            this.toast.warning("Preencha o título da tarefa.");
            return;
        }

        const formData = this.taskFormController.serialize();
        const taskId = formData.id ? Number(formData.id) : null;
        const user = this.storage.getUser();

        this.taskFormController.setBusy(true, taskId ? "Atualizando..." : "Criando...");

        try {
            const taskEntity = new Task({
                id: taskId,
                userId: user?.id || 1,
                title: formData.title,
                description: formData.description || "",
                priority: formData.priority || "Média",
                dueDate: formData.due_date || null,
                statusId: taskId ? (this.tasksList.find((t) => t.id === taskId)?.statusId || 1) : 1
            });

            const response = taskId
                ? await this.tasksService.update(taskId, taskEntity.toJSON())
                : await this.tasksService.create(taskEntity.toJSON());

            if (response?.status === "success" || response?.status === "created" || response?.code === 201) {
                this.toast.success(taskId ? "Tarefa atualizada com sucesso!" : "Tarefa criada com sucesso!");
                this.closeTaskDialog();
                await this.loadTasks();
            } else {
                this.toast.error(response?.message || "Não foi possível salvar a tarefa.");
            }
        } catch (error) {
            this.toast.error(`Erro: ${error.message}`);
        } finally {
            this.taskFormController.setBusy(false);
        }
    }

    bindTaskActions() {
        const container = document.querySelector("#tasks-list-container");
        if (!container) return;

        container.addEventListener("click", async (event) => {
            const toggleBtn = event.target.closest("[data-task-toggle]");
            const galleryBtn = event.target.closest("[data-task-gallery]");
            const editBtn = event.target.closest("[data-task-edit]");
            const deleteBtn = event.target.closest("[data-task-delete]");

            if (toggleBtn) {
                const taskId = Number(toggleBtn.dataset.taskToggle);
                await this.toggleTaskStatus(taskId);
            } else if (galleryBtn) {
                const taskId = Number(galleryBtn.dataset.taskGallery);
                const task = this.tasksList.find((t) => t.id === taskId);
                if (task) this.openGalleryDialog(task);
            } else if (editBtn) {
                const taskId = Number(editBtn.dataset.taskEdit);
                const task = this.tasksList.find((t) => t.id === taskId);
                if (task) this.openTaskDialog(task);
            } else if (deleteBtn) {
                const taskId = Number(deleteBtn.dataset.taskDelete);
                await this.deleteTask(taskId);
            }
        });
    }

    async toggleTaskStatus(taskId) {
        const task = this.tasksList.find((t) => t.id === taskId);
        if (!task) return;

        const originalStatus = task.statusId;
        const newStatus = task.toggleStatus();

        this.renderTasks();
        this.updateMetrics();

        try {
            const response = await this.tasksService.update(taskId, { status_id: newStatus });
            if (response?.status === "success" || response?.code === 200) {
                this.toast.success(task.isCompleted() ? "Tarefa concluída!" : "Tarefa reaberta.");
            } else {
                task.statusId = originalStatus;
                this.renderTasks();
                this.updateMetrics();
                this.toast.error(response?.message || "Erro ao atualizar status.");
            }
        } catch (error) {
            task.statusId = originalStatus;
            this.renderTasks();
            this.updateMetrics();
            this.toast.error(`Falha: ${error.message}`);
        }
    }

    async deleteTask(taskId) {
        const task = this.tasksList.find((t) => t.id === taskId);
        if (!task) return;

        if (!window.confirm(`Deseja remover a tarefa "${task.title}"?`)) return;

        try {
            const response = await this.tasksService.remove(taskId);
            if (response?.status === "success" || response?.code === 200) {
                this.toast.success("Tarefa removida com sucesso!");
                this.tasksList = this.tasksList.filter((t) => t.id !== taskId);
                this.renderTasks();
                this.updateMetrics();
            } else {
                this.toast.error(response?.message || "Não foi possível excluir.");
            }
        } catch (error) {
            this.toast.error(`Erro ao excluir: ${error.message}`);
        }
    }

    async loadTasks() {
        const container = document.querySelector("#tasks-list-container");
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                <div class="tasks-spinner"></div>
                <p style="margin-top: 0.8rem;">Carregando tarefas...</p>
            </div>
        `;

        try {
            const response = await this.tasksService.list();

            if (response?.status === "error" || response?.type === "error") {
                throw new Error(response?.message || "Falha ao carregar tarefas.");
            }

            const rawTasks = Array.isArray(response?.data)
                ? response.data
                : (Array.isArray(response) ? response : []);

            this.tasksList = rawTasks.map((raw) => Task.fromJSON(raw));
            this.renderTasks();
            this.updateMetrics();
        } catch (error) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2.5rem; color: #DC2626;">
                    <p style="font-weight: 600;">Não foi possível carregar as tarefas (${escapeHtml(error.message)}).</p>
                    <button type="button" class="btn-new-task" id="btn-retry-tasks" style="margin-top: 1rem; background: var(--text-secondary);">
                        Tentar Novamente
                    </button>
                </div>
            `;
            document.querySelector("#btn-retry-tasks")?.addEventListener("click", () => this.loadTasks());
        }
    }

    renderTasks() {
        const container = document.querySelector("#tasks-list-container");
        const countBadge = document.querySelector("#tasks-count-badge");
        if (!container) return;

        const filtered = this.tasksList.filter((task) => {
            const matchesSearch = !this.searchTerm
                || task.title.toLocaleLowerCase("pt-BR").includes(this.searchTerm)
                || (task.description && task.description.toLocaleLowerCase("pt-BR").includes(this.searchTerm));

            if (!matchesSearch) return false;

            if (this.activeFilter === "pending") return !task.isCompleted();
            if (this.activeFilter === "completed") return task.isCompleted();
            return true;
        });

        if (countBadge) {
            countBadge.textContent = `${filtered.length} tarefa(s)`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-secondary);">
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">
                        ${this.searchTerm ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa neste filtro"}
                    </h3>
                    <p style="font-size: 0.88rem; max-width: 380px; margin: 0 auto; color: var(--text-muted);">
                        ${this.searchTerm ? "Tente buscar por outras palavras." : "Clique em 'Nova Tarefa' para cadastrar sua primeira atividade."}
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map((task) => {
            const completed = task.isCompleted();
            const overdue = task.isOverdue();
            const priorityClass = (task.priority || "media").toLowerCase().replace("é", "e");
            const formattedDate = task.getFormattedDueDate();

            return `
                <article class="task-item-card ${completed ? "is-completed" : ""}" data-task-id="${task.id}">
                    <button 
                        type="button" 
                        class="task-toggle-btn" 
                        data-task-toggle="${task.id}" 
                        aria-label="${completed ? "Marcar como pendente" : "Marcar como concluída"}"
                        title="${completed ? "Reabrir tarefa" : "Concluir tarefa"}">
                        <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                    </button>

                    <div class="task-info">
                        <h3>${escapeHtml(task.title)}</h3>
                        <p>
                            <span>${escapeHtml(task.description || "Sem descrição")}</span>
                            ${task.dueDate ? `
                                <span>•</span>
                                <span class="task-due-tag ${overdue ? "is-overdue" : ""}">
                                    <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
                                    Prazo: ${formattedDate} ${overdue ? "(Atrasada)" : ""}
                                </span>
                            ` : ""}
                        </p>
                    </div>

                    <div class="task-meta-right">
                        <span class="badge-priority ${priorityClass}">${escapeHtml(task.priority)}</span>

                        <div class="task-actions">
                            <button 
                                type="button" 
                                class="task-action-btn" 
                                data-task-gallery="${task.id}" 
                                aria-label="Galeria de Imagens" 
                                title="Gerenciar imagens da tarefa">
                                <i data-lucide="image" style="width: 15px; height: 15px;"></i>
                                <span>Imagens</span>
                            </button>
                            <button 
                                type="button" 
                                class="task-action-btn" 
                                data-task-edit="${task.id}" 
                                aria-label="Editar" 
                                title="Editar tarefa">
                                <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
                            </button>
                            <button 
                                type="button" 
                                class="task-action-btn task-action-btn--delete" 
                                data-task-delete="${task.id}" 
                                aria-label="Excluir" 
                                title="Excluir tarefa">
                                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        this.refreshIcons();
    }

    updateMetrics() {
        const total = this.tasksList.length;
        const completed = this.tasksList.filter((t) => t.isCompleted()).length;
        const pending = total - completed;

        const totalEl = document.querySelector("#metric-total-tasks");
        const completedEl = document.querySelector("#metric-completed-tasks");
        const pendingEl = document.querySelector("#metric-pending-tasks");

        if (totalEl) totalEl.textContent = total;
        if (completedEl) completedEl.textContent = completed;
        if (pendingEl) pendingEl.textContent = pending;
    }

    /* =====================================================
       ETAPA 07 (PARTE A) — PERFIL E UPLOAD DE FOTO DO USUÁRIO
       ===================================================== */

    bindProfile() {
        this.profileForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleProfileUpdate();
        });

        const photoInput = document.querySelector("[data-profile-photo-input]");
        photoInput?.addEventListener("change", (event) => {
            this.previewProfilePhoto(event.currentTarget.files?.[0] || null);
        });

        this.profilePhotoForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleProfilePhotoUpload();
        });
    }

    async loadProfileFromApi() {
        try {
            const response = await this.usersService.getMe();
            if (response?.status === "success" && response.data) {
                this.syncUserSession(response.data);
                this.profileFormController?.populate({
                    name: response.data.name || "",
                    email: response.data.email || ""
                });
            } else {
                const cached = this.storage.getUser();
                if (cached) {
                    this.profileFormController?.populate({
                        name: cached.name || "",
                        email: cached.email || ""
                    });
                }
            }
        } catch {
            const cached = this.storage.getUser();
            if (cached) {
                this.profileFormController?.populate({
                    name: cached.name || "",
                    email: cached.email || ""
                });
            }
        }
    }

    syncUserSession(changes) {
        const current = this.storage.getUser() || {};
        const merged = { ...current, ...changes };
        const token = merged.token || this.storage.getToken();
        if (token) {
            this.storage.saveSession(token, merged);
            this.configureAuth();
        }
        this.renderUserFromSession();
        return merged;
    }

    async handleProfileUpdate() {
        if (!this.profileFormController) return;

        const validation = this.profileFormController.validate({
            name: { required: true, label: "Nome", minLength: 2 },
            email: { required: true, label: "E-mail", email: true }
        });

        if (!validation.isValid) {
            this.setFeedback("[data-profile-feedback]", "Verifique os campos obrigatórios.", "error");
            return;
        }

        const data = this.profileFormController.serialize();
        const currentPassword = data.current_password || "";
        const newPassword = data.new_password || "";

        if (Boolean(currentPassword) !== Boolean(newPassword)) {
            this.setFeedback("[data-profile-feedback]", "Para alterar a senha, preencha a senha atual e a nova senha.", "error");
            return;
        }

        if (newPassword && newPassword.length < 6) {
            this.setFeedback("[data-profile-feedback]", "A nova senha deve ter no mínimo 6 caracteres.", "error");
            return;
        }

        const payload = {
            name: data.name,
            email: data.email
        };
        if (currentPassword && newPassword) {
            payload.current_password = currentPassword;
            payload.new_password = newPassword;
        }

        this.profileFormController.setBusy(true, "Salvando...");
        this.setFeedback("[data-profile-feedback]", "");

        try {
            const response = await this.usersService.update(payload);
            if (response?.status !== "success" || !response.data) {
                throw new Error(response?.message || "Não foi possível atualizar seu perfil.");
            }

            this.syncUserSession(response.data);
            this.profileForm.elements.namedItem("current_password").value = "";
            this.profileForm.elements.namedItem("new_password").value = "";
            this.setFeedback("[data-profile-feedback]", response.message || "Perfil atualizado com sucesso!", "success");
            this.toast.success("Dados do perfil atualizados!");
        } catch (error) {
            this.setFeedback("[data-profile-feedback]", error.message, "error");
            this.toast.error(error.message);
        } finally {
            this.profileFormController.setBusy(false);
        }
    }

    previewProfilePhoto(file) {
        if (this.profilePhotoObjectUrl) {
            URL.revokeObjectURL(this.profilePhotoObjectUrl);
            this.profilePhotoObjectUrl = null;
        }

        if (!file) {
            const user = this.storage.getUser() || {};
            this.updateAvatarElement("[data-profile-photo]", "[data-profile-initials]", user.photo);
            return;
        }

        this.profilePhotoObjectUrl = URL.createObjectURL(file);
        this.updateAvatarElement("[data-profile-photo]", "[data-profile-initials]", this.profilePhotoObjectUrl);
    }

    async handleProfilePhotoUpload() {
        if (!this.profilePhotoForm) return;

        const input = this.profilePhotoForm.querySelector("[data-profile-photo-input]");
        const submitBtn = this.profilePhotoForm.querySelector("[type='submit']");
        const file = input?.files?.[0];

        if (!file) {
            this.setFeedback("[data-profile-photo-feedback]", "Selecione uma imagem antes de enviar.", "error");
            return;
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            this.setFeedback("[data-profile-photo-feedback]", "Formato inválido. Escolha uma imagem JPG, PNG ou WEBP.", "error");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.setFeedback("[data-profile-photo-feedback]", "A imagem excede o tamanho máximo de 5 MB.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
        this.setFeedback("[data-profile-photo-feedback]", "");

        try {
            const formData = new FormData(this.profilePhotoForm);
            const response = await this.usersService.uploadPhoto(formData);

            if (response?.status !== "success" || !response.data?.photo) {
                throw new Error(response?.message || "Não foi possível atualizar sua foto.");
            }

            if (this.profilePhotoObjectUrl) {
                URL.revokeObjectURL(this.profilePhotoObjectUrl);
                this.profilePhotoObjectUrl = null;
            }

            this.syncUserSession({ photo: response.data.photo });
            this.profilePhotoForm.reset();
            this.setFeedback("[data-profile-photo-feedback]", response.message || "Foto atualizada com sucesso!", "success");
            this.toast.success("Foto de perfil atualizada!");
        } catch (error) {
            this.setFeedback("[data-profile-photo-feedback]", error.message, "error");
            this.toast.error(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Atualizar Foto";
        }
    }

    /* =====================================================
       ETAPA 07 (PARTE B) — GALERIA DE IMAGENS DA TAREFA (1:N)
       ===================================================== */

    bindGallery() {
        document.querySelectorAll("[data-gallery-close]").forEach((btn) => {
            btn.addEventListener("click", () => this.closeGalleryDialog());
        });

        const fileInput = document.querySelector("#task-images-input");
        fileInput?.addEventListener("change", (event) => {
            this.previewTaskGallerySelection(event.currentTarget.files);
        });

        this.galleryForm?.addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleTaskImagesUpload();
        });

        document.querySelector("#task-gallery-list")?.addEventListener("click", async (event) => {
            const deleteBtn = event.target.closest("[data-delete-image]");
            if (!deleteBtn) return;
            const imageId = Number(deleteBtn.dataset.deleteImage);
            await this.handleDeleteTaskImage(imageId);
        });
    }

    openGalleryDialog(task) {
        if (!this.galleryDialog) return;

        this.activeGalleryTaskId = task.id;
        const titleEl = document.querySelector("#gallery-task-title");
        if (titleEl) {
            titleEl.textContent = `Imagens: ${task.title}`;
        }

        this.galleryForm?.reset();
        this.clearGalleryPreviews();
        this.setFeedback("[data-gallery-feedback]", "");

        this.galleryDialog.showModal();
        this.loadTaskImages(task.id);
        this.refreshIcons();
    }

    closeGalleryDialog() {
        if (this.galleryDialog?.open) {
            this.galleryDialog.close();
        }
        this.activeGalleryTaskId = null;
        this.clearGalleryPreviews();
    }

    clearGalleryPreviews() {
        this.galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        this.galleryPreviewUrls = [];
        const previewContainer = document.querySelector("#task-images-preview");
        if (previewContainer) {
            previewContainer.innerHTML = "";
            previewContainer.hidden = true;
        }
    }

    previewTaskGallerySelection(fileList) {
        this.clearGalleryPreviews();
        const previewContainer = document.querySelector("#task-images-preview");
        if (!previewContainer || !fileList || fileList.length === 0) return;

        Array.from(fileList).forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const objUrl = URL.createObjectURL(file);
            this.galleryPreviewUrls.push(objUrl);

            const thumb = document.createElement("div");
            thumb.className = "gallery-preview-thumb";
            const img = document.createElement("img");
            img.src = objUrl;
            img.alt = file.name;
            thumb.appendChild(img);
            previewContainer.appendChild(thumb);
        });

        previewContainer.hidden = this.galleryPreviewUrls.length === 0;
    }

    async loadTaskImages(taskId) {
        const listEl = document.querySelector("#task-gallery-list");
        const badgeEl = document.querySelector("#gallery-count-badge");
        if (!listEl) return;

        listEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                <div class="tasks-spinner"></div>
                <p style="margin-top: 0.6rem; font-size: 0.85rem;">Carregando imagens da tarefa...</p>
            </div>
        `;

        try {
            const response = await this.taskImagesService.list(taskId);
            if (response?.status === "error" || response?.type === "error") {
                throw new Error(response?.message || "Erro ao listar imagens.");
            }

            const rawList = Array.isArray(response?.data) ? response.data : [];
            const images = rawList.map((item) => TaskImage.fromJSON(item));

            if (badgeEl) {
                badgeEl.textContent = `${images.length} imagem(ns)`;
            }

            if (images.length === 0) {
                listEl.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                        <p style="font-size: 0.88rem; font-weight: 600; color: var(--text-secondary);">Nenhuma imagem associada a esta tarefa.</p>
                        <small style="font-size: 0.78rem;">Selecione um ou mais arquivos acima para enviar.</small>
                    </div>
                `;
                return;
            }

            listEl.innerHTML = images.map((img) => {
                const safeUrl = this.getSafePhotoUrl(img.url) || "";
                const alt = escapeHtml(img.altText || "Imagem da tarefa");
                return `
                    <article class="gallery-card" data-image-id="${img.id}">
                        <a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" class="gallery-card__img-wrap" title="Abrir imagem original">
                            <img src="${escapeHtml(safeUrl)}" alt="${alt}">
                        </a>
                        <div class="gallery-card__body">
                            <span class="gallery-card__alt" title="${alt}">${alt}</span>
                            <button type="button" class="gallery-card__delete" data-delete-image="${img.id}">
                                <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                                Remover
                            </button>
                        </div>
                    </article>
                `;
            }).join("");

            this.refreshIcons();
        } catch (error) {
            listEl.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: #DC2626;">
                    <p style="font-size: 0.85rem; font-weight: 600;">Falha ao carregar galeria: ${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }

    async handleTaskImagesUpload() {
        if (!this.activeGalleryTaskId || !this.galleryForm) return;

        const fileInput = this.galleryForm.querySelector("#task-images-input");
        const submitBtn = this.galleryForm.querySelector("#btn-upload-task-images");
        const files = fileInput?.files;

        if (!files || files.length === 0) {
            this.setFeedback("[data-gallery-feedback]", "Selecione pelo menos uma imagem para enviar.", "error");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        for (const file of Array.from(files)) {
            if (!allowedTypes.includes(file.type)) {
                this.setFeedback("[data-gallery-feedback]", `Formato não suportado (${file.name}). Use JPG, PNG ou WEBP.`, "error");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.setFeedback("[data-gallery-feedback]", `O arquivo "${file.name}" excede o limite de 5 MB.`, "error");
                return;
            }
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
        this.setFeedback("[data-gallery-feedback]", "");

        try {
            const formData = new FormData(this.galleryForm);
            const response = await this.taskImagesService.upload(this.activeGalleryTaskId, formData);

            if (response?.status !== "created" && response?.status !== "success") {
                throw new Error(response?.message || "Erro ao enviar imagem(ns).");
            }

            this.galleryForm.reset();
            this.clearGalleryPreviews();
            this.setFeedback("[data-gallery-feedback]", response.message || "Imagem(ns) enviada(s) com sucesso!", "success");
            this.toast.success("Galeria atualizada com sucesso!");
            await this.loadTaskImages(this.activeGalleryTaskId);
        } catch (error) {
            this.setFeedback("[data-gallery-feedback]", error.message, "error");
            this.toast.error(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Enviar Imagem(ns)";
        }
    }

    async handleDeleteTaskImage(imageId) {
        if (!this.activeGalleryTaskId || !imageId) return;

        if (!window.confirm("Deseja remover esta imagem da tarefa?")) return;

        try {
            const response = await this.taskImagesService.remove(this.activeGalleryTaskId, imageId);
            if (response?.status === "success" || response?.code === 200) {
                this.toast.success("Imagem removida da tarefa!");
                await this.loadTaskImages(this.activeGalleryTaskId);
            } else {
                this.toast.error(response?.message || "Não foi possível remover a imagem.");
            }
        } catch (error) {
            this.toast.error(error.message);
        }
    }

    setFeedback(selector, message, type = "") {
        const el = document.querySelector(selector);
        if (!el) return;
        el.textContent = message;
        el.className = `profile-feedback${type ? ` is-${type}` : ""}`;
    }

    bindLogout() {
        document.querySelectorAll("[data-app-logout]").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.storage.clearSession();
                window.location.replace("../index.html");
            });
        });
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
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

document.addEventListener("DOMContentLoaded", () => {
    const guard = new AuthGuard("../index.html");

    if (guard.protect()) {
        const app = new AppDashboard();
        app.init();
    }
});
