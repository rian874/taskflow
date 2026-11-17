import { fetchFAQs } from "./faqs.js";
import SessionStorage from "../../_common/scripts/storage.js";

document.addEventListener("DOMContentLoaded", () => {
    initScrollAnimations();
    initMobileMenu();
    initFAQ();
    initSmoothScroll();
    initCounterAnimation();
    initHeaderScroll();
    initHeroInteractiveMockup();
    initPricingSwitcher();
    initUserSessionHeader();
    initBackToTop();
});

/* ---- Animações no Scroll ---- */
function initScrollAnimations() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    document.documentElement.classList.add("js-ready");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
}

/* ---- Menu Mobile ---- */
function initMobileMenu() {
    const btn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const closeBtn = document.getElementById("mobile-menu-close");
    const links = menu?.querySelectorAll("a, button[data-auth-open]");

    if (!btn || !menu) return;

    const open = () => {
        menu.classList.add("open");
        document.body.style.overflow = "hidden";
        btn.setAttribute("aria-expanded", "true");
    };

    const close = () => {
        menu.classList.remove("open");
        document.body.style.overflow = "";
        btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", () => {
        menu.classList.contains("open") ? close() : open();
    });

    closeBtn?.addEventListener("click", close);

    links?.forEach((link) => {
        link.addEventListener("click", close);
    });
}

/* ---- FAQ Accordion com Delegação de Eventos ---- */
function initFAQ() {
    const listFaqs = document.querySelector("#list-faqs");
    if (!listFaqs) return;

    listFaqs.addEventListener("click", (e) => {
        const btn = e.target.closest(".faq-question");
        if (!btn) return;

        const expanded = btn.getAttribute("aria-expanded") === "true";
        const item = btn.closest(".faq-item");
        const answer = item ? item.querySelector(".faq-answer") : null;

        if (!answer) return;

        // Fecha as outras perguntas para estilo sanfona elegante
        listFaqs.querySelectorAll(".faq-question").forEach((otherBtn) => {
            if (otherBtn !== btn) {
                otherBtn.setAttribute("aria-expanded", "false");
                const otherAnswer = otherBtn.closest(".faq-item")?.querySelector(".faq-answer");
                if (otherAnswer) {
                    otherAnswer.classList.remove("open");
                }
            }
        });

        btn.setAttribute("aria-expanded", String(!expanded));
        answer.classList.toggle("open", !expanded);
    });

    fetchFAQs();
}

/* ---- Smooth Scroll ---- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const href = anchor.getAttribute("href");
            if (href === "#" || !href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({ top, behavior: "smooth" });
            }
        });
    });
}

/* ---- Animação dos Contadores Numéricos ---- */
function initCounterAnimation() {
    const counters = document.querySelectorAll("[data-count]");
    if (counters.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute("data-count"), 10);
                    const suffix = el.getAttribute("data-suffix") || "";
                    const duration = 1800;
                    const start = performance.now();

                    const animate = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.floor(eased * target);
                        el.textContent = current.toLocaleString("pt-BR") + suffix;
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            el.textContent = target.toLocaleString("pt-BR") + suffix;
                        }
                    };

                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
}

/* ---- Header Efeito ao Rolar ---- */
function initHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const checkScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add("header--scrolled");
        } else {
            header.classList.remove("header--scrolled");
        }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
}

/* ---- Mockup Interativo no Hero ---- */
function initHeroInteractiveMockup() {
    const tasks = document.querySelectorAll(".mockup-task-item");
    const progressFill = document.querySelector("#mockup-progress-fill");
    const progressText = document.querySelector("#mockup-progress-text");

    if (!tasks.length || !progressFill || !progressText) return;

    const updateProgress = () => {
        const total = tasks.length;
        const done = document.querySelectorAll(".mockup-task-item.is-done").length;
        const percentage = Math.round((done / total) * 100);

        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${done}/${total} (${percentage}%)`;
    };

    tasks.forEach((task) => {
        task.addEventListener("click", () => {
            task.classList.toggle("is-done");
            updateProgress();
        });
    });

    updateProgress();
}

/* ---- Seletor de Planos: Mensal vs Anual ---- */
function initPricingSwitcher() {
    const switcher = document.querySelector("#pricing-switcher");
    const proPrice = document.querySelector("#pro-price-val");
    const proPeriod = document.querySelector("#pro-period-label");
    const labelMonthly = document.querySelector("[data-pricing-label='monthly']");
    const labelAnnual = document.querySelector("[data-pricing-label='annual']");

    if (!switcher || !proPrice) return;

    let isAnnual = false;

    const updatePricing = () => {
        if (isAnnual) {
            switcher.classList.add("is-active");
            proPrice.textContent = "R$ 23";
            if (proPeriod) proPeriod.textContent = "/mês (faturado anualmente)";
            labelMonthly?.classList.remove("is-active");
            labelAnnual?.classList.add("is-active");
        } else {
            switcher.classList.remove("is-active");
            proPrice.textContent = "R$ 29";
            if (proPeriod) proPeriod.textContent = "/mês";
            labelMonthly?.classList.add("is-active");
            labelAnnual?.classList.remove("is-active");
        }
    };

    switcher.addEventListener("click", () => {
        isAnnual = !isAnnual;
        updatePricing();
    });

    labelMonthly?.addEventListener("click", () => {
        isAnnual = false;
        updatePricing();
    });

    labelAnnual?.addEventListener("click", () => {
        isAnnual = true;
        updatePricing();
    });
}

/* ---- Detecção de Sessão no Header ---- */
function initUserSessionHeader() {
    const storage = new SessionStorage();
    const token = storage.getToken();
    const user = storage.getUser();
    const headerActions = document.querySelector(".header-actions");

    if (!headerActions) return;

    if (token && user) {
        const firstName = (user.name || "Usuário").split(" ")[0];
        const initials = (user.name || "US")
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase();

        headerActions.innerHTML = `
            <div class="header-user-badge">
                <span class="header-avatar">${initials}</span>
                <span>Olá, ${firstName}</span>
            </div>
            <a href="app/index.html" class="btn btn-primary">
                Meu Painel
                <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
            </a>
            <button type="button" class="btn btn-secondary" id="btn-header-logout" title="Sair da conta">
                <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
            </button>
        `;

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        document.querySelector("#btn-header-logout")?.addEventListener("click", () => {
            storage.clearSession();
            window.location.reload();
        });
    }
}

/* ---- Botão Flutuante de Voltar ao Topo ---- */
function initBackToTop() {
    const btn = document.querySelector("#back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 450) {
            btn.classList.add("is-visible");
        } else {
            btn.classList.remove("is-visible");
        }
    }, { passive: true });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
