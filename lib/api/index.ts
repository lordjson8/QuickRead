import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api", // your api base url
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
