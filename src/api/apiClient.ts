

import axios from "axios";
import { URL } from "./config";
import { getValue, clearValue } from "../utils/localstorage/index";
import { isThrottled } from "./requestThrottler";
import { isGlobalRateLimited } from "./ratelimitter";
import { navigationRef } from "./methods";
import { notificationHelper } from "@src/commonComponent";

export const api = axios.create({
  baseURL: `${URL}/api/`,
});

let apiCallCount = 0;
let lastGlobalWarningTime = 0; // Throttle toast popups too

api.interceptors.request.use(
  async (config) => {
    try {
      const isWhitelisted = config.url && (
        config.url.includes("language") ||
        config.url.includes("translate") ||
        config.url.includes("settings") ||
        config.url.includes("home-screen") ||
        config.url.includes("self")
      );

      // 1. GLOBAL RATE LIMIT (Burst protection: 20 per 10s)
      if (!isWhitelisted && isGlobalRateLimited()) {
        const now = Date.now();
        if (now - lastGlobalWarningTime > 3000) { // Don't spam the toast itself
          notificationHelper("", "Too many attempts. Please wait.", "error");
          lastGlobalWarningTime = now;
        }
        const error: any = new Error(`[GlobalLimit] Overload: 20/10s`);
        error.response = { status: 429, data: { message: "Too many attempts" } };
        return Promise.reject(error);
      }

      // 2. PER-ENDPOINT THROTTLER (Same URL spam: 1 per 2s)
      if (config.url && !isWhitelisted && isThrottled(config.url)) {
        const error: any = new Error(`[Throttler] Blocked duplicate: ${config.url}`);
        error.response = { status: 429, data: { message: "Too many requests" } };
        return Promise.reject(error);
      }



      const token = await getValue("token");
      const language = await getValue("selectedLanguage");
      const defaultLng = await getValue("defaultLanguage");
      const currentLng = language || defaultLng;

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      config.headers.set("Accept-Lang", currentLng);
      config.headers.set("Accept", "application/json");

      const isFormData = config.data instanceof FormData || (config.data && config.data._parts);
      if (isFormData) {
        config.headers.delete("Content-Type");
      } else {
        config.headers.set("Content-Type", "application/json");
      }

      const callTime = new Date().toLocaleTimeString();
      console.log(`[API #${++apiCallCount}] [${callTime}] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });

      return config;
    } catch (e: any) {
      console.error(`[API Request Error]`, e);
      return Promise.reject(e);
    }
  },
  (error) => {
    console.error(`[API Request Interceptor Error]`, error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // Log response details
    return response;
  },
  async (error) => {
    // Log specifically if the error is from the response (status code etc)
    if (error.response) {
      console.error(
        `[API Response Error] ${error.response.status} ${error.config.url}`,
        error.response.data,
      );
    } else {
      console.error(`[API Network/Unknown Error] ${error.message || 'No message'}`, error);
    }

    if (error.name === "AbortError") {
      return Promise.reject(new Error("Request cancelled"));
    }

    if (error.response?.status === 429) {
      notificationHelper("", "Too many attempts. Please wait a minute before trying again", "error");
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const token = await getValue("token");



      if (token) {
        await clearValue();
        notificationHelper("", "Session Expired", "error");
        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      }
    }

    return Promise.reject(error);
  },
);
