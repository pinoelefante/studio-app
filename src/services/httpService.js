import axios from 'axios'
import config from '../config.json'
import { toast } from 'react-toastify'

axios.interceptors.response.use(success => {
    if (config.httpDebug) toast.info(success.request.responseURL);
    return success;
}, 
error => {
    const expectedError = error.response && error.response.status >= 400 && error.response.status < 500;
    if (!expectedError) {
        console.log("Unexpected error", error);
    }
    return Promise.reject(error);
});
axios.defaults.baseURL = config.apiEndpoint;

export function loadFile(endpoint, dataName, dataContent) {
    const formData = new FormData();
    formData.append(dataName, dataContent);
    return axios({
        method: "POST",
        url: endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data"
        }
    });
}

export function createUrl(path="") {
    const sep = path.startsWith("/") || config.apiEndpoint.endsWith('/') ? '' : '/';
    return config.apiEndpoint + sep + path;
} 

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete
}