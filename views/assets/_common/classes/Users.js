import HttpClientBase from "./HttpClientBase.js";

export default class Users extends HttpClientBase {
    async login(email, password) {
        return this.postForm("/users/login", { email, password });
    }

    async loginFromForm(form) {
        return this.postForm("/users/login", form);
    }

    async loginAdmin(email, password) {
        return this.postForm("/users/login-admin", { email, password });
    }

    async register(data) {
        return this.postForm("/users/register", data);
    }

    async list() {
        return this.get("/users/list");
    }

    async getMe() {
        return this.get("/users/me");
    }

    async update(data) {
        return this.putForm("/users/update", data);
    }

    async uploadPhoto(formData) {
        return this.post("/users/photo", this.toFormData(formData));
    }
}
