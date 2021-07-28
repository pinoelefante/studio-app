import http from './httpService'

export default {
    getFirms: async () =>  await http.get("anagraphic/firm"),
    getFirm: async (firmId) => await http.get("anagraphic/firm/" + firmId),
    createFirm: async (firm) => await http.post("anagraphic/firm", firm),
    updateFirm: async (firmId, firm) => await http.put("anagraphic/firm/" + firmId, firm),
    deleteFirm: async (firmId) => await http.delete("anagraphic/firm/" + firmId),
    getFirmPlaces: async (firmId) => await http.get("anagraphic/firm/" + firmId + "/place"),
    getFirmPlace: async (firmId, placeId) => await http.get("anagraphic/firm/" + firmId + "/place/" + placeId),
    createFirmPlace: async (firmId, place) => await http.post("anagraphic/firm/" + firmId + "/place", place),
    updateFirmPlace: async (firmId, placeId, place) => await http.put("anagraphic/firm/" + firmId + "/place/" + placeId, place),
    deleteFirmPlace: async(firmId, placeId) => await http.delete("anagraphic/firm/" + firmId + "/place/" + placeId),
    getFirmContacts: async(firmId) => await http.get("anagraphic/firm/" + firmId + "/contact"),
    createFirmContact: async(firmId, contact) => await http.post("anagraphic/firm/" + firmId + "/contact", contact),
    deleteFirmContact: async(firmId, contacts) => await http.delete("anagraphic/firm/" + firmId + "/contact", contacts),
    getFirmPec: async(firmId) => await http.get("anagraphic/firm/" + firmId + "/pec"),
    createFirmPec: async(firmId, pec) => await http.post("anagraphic/firm/" + firmId + "/pec", pec),
    deleteFirmPec: async(firmId) => await http.delete("anagraphic/firm/" + firmId),
    updateDelegations: async() => await http.post("ade/delegations"),
    getDelegations: async(firmId) => await http.get("ade/delegations/" + firmId)
}
