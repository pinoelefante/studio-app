import http from './httpService';

export default {
    login: async(username, password) => await http.post("/auth/login", {username, password}),
    signin: async(username, password) => await http.post("/auth/signin", {username, password}),
    logout: async() => await http.post("/auth/logout"),
    canCreate: () => http.get("/auth/create"),
    setTokenHeader: (token) => { localStorage.setItem("authToken", token); }
}