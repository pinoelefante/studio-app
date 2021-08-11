import axios from 'axios'
import config from '../config.json'
import { toast } from 'react-toastify'

axios.interceptors.request.use(request => {
    const token = localStorage.getItem("authToken");
    if (token) {
        request.headers.token = token;
    }
    return request;
});
axios.interceptors.response.use(success => {
    if (config.httpDebug) toast.info(success.request.responseURL);
    return success;
}, 
error => {
    const loginRequired = error.response && (error.response.status === 403 || error.response.status === 500);
    
    console.log("httpError", error);
    if (loginRequired) {
        window.location = "/login";
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

export function createUrl(path="", firstParamToken=false) {
    const token = localStorage.getItem("authToken");
    const sep = path.startsWith("/") || config.apiEndpoint.endsWith('/') ? '' : '/';
    return config.apiEndpoint + sep + path + (firstParamToken ? '?' : '&') + "token=" + token;
} 

export default {
    get: axios.get,
    post: axios.post,
    put: axios.put,
    delete: axios.delete
}