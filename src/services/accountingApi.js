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
    runFeeJob: async() => await http.post("accounting/jobs/feeJob"),
    runBolloJob: async() => await http.post("accounting/jobs/bolloJob"),
    addAdeAccount: async(account) => await http.post("ade/account", account),
    getAdeAccounts: async() => await http.get("ade/account"),
    updateAdeAccountPassword: async(fiscalCode, oldPass, newPass) => await http.put(`ade/account?fiscalCode=${fiscalCode}&old=${oldPass}&new=${newPass}`),
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
        return createUrl(`accounting/invoice/${firmId}/${invoiceId}/download`, true);
    },
    getInvoiceViewUrl: (firmId, invoiceId) => {
        return createUrl(`accounting/invoice/${firmId}/${invoiceId}/view`, true);
    },
    getInvoiceAttachmentsUrl: (firmId, invoiceId) => {
        return createUrl(`accounting/invoice/${firmId}/${invoiceId}/attachment`, true);
    },
    getInvoiceDownloadRules: async (firmId) => {
        return await http.get(`accounting/invoice/${firmId}/download_rules`);
    },
    getBolloDownloadUrl: (firmId, year, trimester) => {
        return createUrl(`accounting/bollo/${firmId}/${year}/${trimester}/download`, true);
    },
    getInvoiceJournal: async () => {
        return await http.get("accounting/journal/invoice");
    },
    getBolloJournal: async () => {
        return await http.get("accounting/journal/bollo");
    },
    getFeeJournal: async() => {
        return await http.get("accounting/journal/fee");
    },
    getIncompleteFee: async () => await http.get("accounting/fee/incomplete"),
    removeInvoiceJournal: async({firmId, date}) => {
        return await http.post(`accounting/journal/invoice/${firmId}/${date}`);
    },
    removeBolloInvoiceJournal: async({firmId, year, trimestre}) => {
        return await http.post(`accounting/journal/bollo/${firmId}/${year}/${trimestre}`);
    },
    removeFeeInvoiceJournal: async({firmId, year, month}) => {
        return await http.post(`accounting/journal/fee/${firmId}/${year}/${month}`);
    },
    getBollo: async(firmId, year) => await http.get(`accounting/bollo/${firmId}/${year}`),
    getExpiringDelegationsAccounting: async() => await http.get(`ade/delegations/expiring/accounting`)
}