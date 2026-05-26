import axios, { type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:8080',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => config)