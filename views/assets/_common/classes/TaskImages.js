import HttpClientBase from "./HttpClientBase.js";

export default class TaskImages extends HttpClientBase {
    async list(taskId) {
        return this.get("/tasks/:taskId/images", { taskId });
    }

    async upload(taskId, formData) {
        const payload = this.toFormData(formData);
        return this.post("/tasks/:taskId/images", payload, { taskId });
    }

    async remove(taskId, imageId) {
        return this.delete("/tasks/:taskId/images/:imageId", { taskId, imageId });
    }
}
