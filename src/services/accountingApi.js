import http, {createUrl} from './httpService';
import _ from 'lodash';

export default {
    runAccountingJob: async(firms = []) => {
        if (firms && firms.length > 0) {
            const firmIds = _.join(firms, ',');
            return await http.post(`accounting/jobs/accountingJob/${firmIds}`);
        } else {
            return await http.post("accounting/jobs/accountingJob");
        }
    },
    addAdeAccount: async(account) => await http.post("accounting/account", account),
    getAdeAccounts: async() => await http.get("accounting/account"),
    updateAdeAccountPassword: async(fiscalCode, oldPass, newPass) => await http.put(`accounting/account?fiscalCode=${fiscalCode}&old=${oldPass}&new=${newPass}`),
    getAccountingConfiguration: async(firmId) => await http.get(`accounting/configuration/${firmId}`),
    createAccountingConfiguration: async(firmId, configuration) => await http.post(`accounting/configuration/${firmId}`, configuration),
    deleteAccountingConfiguration: async(firmId) => await http.post(`accounting/configuration/${firmId}`),
    getFees: async(year, month, keepEmpty=false, pdf=false, firm=null) => {
        if (firm === null) {
            return await http.get(`accounting/fee/${year}/${month}?pdf=${pdf}&keepEmpty=${keepEmpty}`);
        } else {
            return await http.get(`accounting/fee/${firm}/${year}/${month}?pdf=${pdf}&keepEmpty=${keepEmpty}`);
        }
    },
    getInvoice: async(firmId, year, month, isSent=true) => await http.get(`accounting/invoice/${firmId}/${year}/${month}?sent=${isSent}`),
    getFirmFeeDownload(year, month, keepEmpty=false, firmId=null) {
        return createUrl(`accounting/fee/${firmId ? `${firmId}/` : ""}${year}/${month}?pdf=true&keepEmpty=${keepEmpty}`);
    },
    getFirmInvoiceDownload: (firmId, invoiceId) => {
        return createUrl(`accounting/invoice/${firmId}/${invoiceId}/download`);        
    },
    getInvoiceViewUrl: (firmId, invoiceId) => {
        return createUrl(`accounting/invoice/${firmId}/${invoiceId}/view`);
    },
    getInvoiceAttachmentsUrl: (firmId, invoiceId) => {
        return createUrl(`accounting/invoice/${firmId}/${invoiceId}/attachment`);
    },
    getInvoiceJournal: async () => {
        return await http.get("accounting/journal");
    },
    removeInvoiceJournal: async({firmId, date}) => {
        return await http.post(`accounting/journal/${firmId}/${date}`);
    }
}