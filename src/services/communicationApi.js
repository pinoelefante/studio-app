import httpService from "./httpService";

export default {
    /* Templates */
    saveTemplate: (template) => httpService.post("/communication/template", template),
    getTemplates: () => httpService.get(`/communication/template/`),
    getTemplate: (id) => httpService.get(`/communication/template/${id}`),
    deleteTemplate: (id) => httpService.delete(`/communication/template/${id}`),
    getTemplateGroups: (id) => httpService.get(`/communication/template/${id}/groups`),

    /* Messages */
    createMessage: (message) => httpService.post(`/communication/message`, message),
    markAsSent: (messageId, status) => httpService.post(`/communication/message/${messageId}/mark_as_sent/${status}`),
    messagesToSend: () => httpService.get("/communication/to_send"),
    saveMessageDraft: (messages) => httpService.put("/communication/message", messages),
    deleteMessage: (messageId) => httpService.delete(`/communication/message/${messageId}`),

    /* Groups */
    createGroup: (group) => httpService.post("/communication/group", group),
    getGroup: (id) => httpService.get(`/communication/group/${id}`),
    addFirmsToGroup: (groupId, firms) => httpService.post(`/communication/group/${groupId}`, firms),
    getFirmsForGroup: (groupId) => httpService.get(`/communication/group/${groupId}/firm`)
}