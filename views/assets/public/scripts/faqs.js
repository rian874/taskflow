import Faqs from "../../_common/classes/Faqs.js";
import FaqCategories from "../../_common/classes/FaqCategories.js";

let allFaqs = [];
let allCategories = [];
let currentCategoryFilter = "";
let currentSearchTerm = "";

export async function fetchFAQs() {
    const listFaqs = document.querySelector("#list-faqs");
    const controlsContainer = document.querySelector("#faq-controls-container");
    if (!listFaqs) return;

    listFaqs.innerHTML = `
        <div class="faq-loading">
            <div class="faq-spinner"></div>
            <p>Carregando perguntas frequentes da API...</p>
        </div>
    `;

    try {
        const faqsService = new Faqs();
        const categoriesService = new FaqCategories();

        const [faqsRes, catsRes] = await Promise.allSettled([
            faqsService.listAll(),
            categoriesService.listAll()
        ]);

        if (faqsRes.status === "rejected") {
            throw faqsRes.reason || new Error("Falha de conexão com a API");
        }

        if (faqsRes.value?.status === "error" || faqsRes.value?.type === "error") {
            throw new Error(faqsRes.value?.message || "Erro retornado pela API");
        }

        allFaqs = Array.isArray(faqsRes.value?.data) ? faqsRes.value.data : [];

        if (catsRes.status === "fulfilled" && catsRes.value?.data) {
            allCategories = Array.isArray(catsRes.value.data) ? catsRes.value.data : [];
        } else {
            allCategories = [];
        }

        renderControls();
        renderFaqList();

    } catch (error) {
        console.error("Erro ao buscar FAQs da API:", error);
        listFaqs.innerHTML = `
            <div class="faq-error">
                <p>Não foi possível carregar as perguntas frequentes da API (${escapeHtml(error.message)}).</p>
                <button type="button" class="btn btn-primary" id="btn-retry-faqs" style="margin-top: 1rem;">
                    Tentar novamente
                </button>
            </div>
        `;
        document.querySelector("#btn-retry-faqs")?.addEventListener("click", fetchFAQs);
    }
}

function renderControls() {
    const controls = document.querySelector("#faq-controls-container");
    if (!controls) return;

    // Categorias presentes
    const categoryButtons = `
        <button type="button" class="faq-cat-btn ${currentCategoryFilter === "" ? "is-active" : ""}" data-faq-cat="">
            Todas (${allFaqs.length})
        </button>
        ${allCategories.map(cat => {
            const count = allFaqs.filter(f => Number(f.faqs_category_id) === Number(cat.id)).length;
            return `
                <button type="button" class="faq-cat-btn ${currentCategoryFilter === String(cat.id) ? "is-active" : ""}" data-faq-cat="${cat.id}">
                    ${escapeHtml(cat.name)} (${count})
                </button>
            `;
        }).join("")}
    `;

    controls.innerHTML = `
        <div class="faq-search-box">
            <i data-lucide="search" aria-hidden="true"></i>
            <input 
                type="search" 
                class="faq-search-input" 
                id="faq-public-search" 
                placeholder="Buscar dúvida por palavra-chave..." 
                value="${escapeHtml(currentSearchTerm)}">
        </div>
        <div class="faq-categories-nav">
            ${categoryButtons}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;" id="faq-counter-label"></div>
    `;

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Eventos de Busca
    const searchInput = controls.querySelector("#faq-public-search");
    searchInput?.addEventListener("input", (e) => {
        currentSearchTerm = e.target.value.toLocaleLowerCase("pt-BR").trim();
        renderFaqList();
    });

    // Eventos de Filtro de Categoria
    controls.querySelectorAll("[data-faq-cat]").forEach(btn => {
        btn.addEventListener("click", () => {
            currentCategoryFilter = btn.dataset.faqCat;
            controls.querySelectorAll("[data-faq-cat]").forEach(b => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            renderFaqList();
        });
    });
}

function renderFaqList() {
    const listFaqs = document.querySelector("#list-faqs");
    if (!listFaqs) return;

    const filtered = allFaqs.filter(faq => {
        const q = (faq.question || "").toLocaleLowerCase("pt-BR");
        const a = (faq.answer || "").toLocaleLowerCase("pt-BR");
        const matchesText = !currentSearchTerm || q.includes(currentSearchTerm) || a.includes(currentSearchTerm);
        const matchesCategory = !currentCategoryFilter || String(faq.faqs_category_id) === currentCategoryFilter;
        return matchesText && matchesCategory;
    });

    const countLabel = document.querySelector("#faq-counter-label");
    if (countLabel) {
        countLabel.textContent = `Exibindo ${filtered.length} de ${allFaqs.length} pergunta(s)`;
    }

    if (filtered.length === 0) {
        listFaqs.innerHTML = `
            <div class="faq-empty">
                <i data-lucide="help-circle" style="width: 36px; height: 36px; color: var(--text-muted); margin-bottom: 0.5rem;"></i>
                <p>Nenhuma pergunta encontrada com os filtros selecionados.</p>
                <button type="button" class="btn btn-secondary" id="faq-reset-filter" style="margin-top: 1rem;">
                    Limpar filtros
                </button>
            </div>
        `;
        if (typeof lucide !== "undefined") lucide.createIcons();

        document.querySelector("#faq-reset-filter")?.addEventListener("click", () => {
            currentSearchTerm = "";
            currentCategoryFilter = "";
            const searchInput = document.querySelector("#faq-public-search");
            if (searchInput) searchInput.value = "";
            renderControls();
            renderFaqList();
        });
        return;
    }

    listFaqs.innerHTML = "";

    filtered.forEach((faq, index) => {
        const itemFaq = document.createElement("div");
        itemFaq.className = "faq-item";
        
        // Categoria da FAQ
        const catObj = allCategories.find(c => Number(c.id) === Number(faq.faqs_category_id));
        const catName = catObj ? catObj.name : "Geral";

        itemFaq.innerHTML = `
            <dt>
                <button type="button" class="faq-question" aria-expanded="${index === 0 && !currentSearchTerm ? 'true' : 'false'}">
                    <span style="display: flex; flex-direction: column; gap: 4px;">
                        <span>${escapeHtml(faq.question)}</span>
                        <small style="font-size: 0.72rem; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${escapeHtml(catName)}
                        </small>
                    </span>
                    <i data-lucide="plus" class="faq-icon" aria-hidden="true"></i>
                </button>
            </dt>
            <dd class="faq-answer ${index === 0 && !currentSearchTerm ? 'open' : ''}">
                <p>${escapeHtml(faq.answer)}</p>
            </dd>
        `;
        listFaqs.appendChild(itemFaq);
    });

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
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
