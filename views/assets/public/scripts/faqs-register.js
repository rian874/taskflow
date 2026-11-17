import Faqs from "../../_common/classes/Faqs.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#faqs-register-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const faqsService = new Faqs();
        try {
            const formData = new FormData(form);
            const response = await faqsService.insert(formData);

            if (response?.code === 201 || response?.status === "created" || response?.type === "success") {
                alert("FAQ cadastrada com sucesso!");
                form.reset();
            } else {
                alert("Erro ao cadastrar: " + (response?.message || "Erro desconhecido"));
            }
        } catch (err) {
            alert("Erro na requisição: " + err.message);
        }
    });
});
