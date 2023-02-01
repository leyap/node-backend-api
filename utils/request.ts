import axios from "axios";

const httpClient = axios.create({
    timeout: 60000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

httpClient.interceptors.request.use(
    (reqConfig) => {
        return reqConfig;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);

httpClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
);

export default httpClient;
