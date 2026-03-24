import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
let isAuthenticated = false;
let cachedQueries = null;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getErrorMessage(prefix, error) {
  const serverMessage = error?.response?.data?.message;
  const genericMessage = error?.message || "Unknown error";
  return `${prefix}: ${serverMessage || genericMessage}`;
}

function markLoggedOut() {
  isAuthenticated = false;
}

function markLoggedIn() {
  isAuthenticated = true;
}

export async function checkAuthSession() {
  try {
    await api.get("/auth/me");
    markLoggedIn();
    return true;
  } catch (_error) {
    markLoggedOut();
    return false;
  }
}

export async function fetchQueries() {
  try {
    const response = await api.get("/queries");

    cachedQueries = response.data?.data || [];
    return cachedQueries;
  } catch (error) {
    if (cachedQueries) {
      return cachedQueries;
    }

    throw new Error(getErrorMessage("Failed to fetch queries", error));
  }
}

export async function submitQuery(queryData) {
  try {
    const response = await api.post("/queries", {
      name: queryData.name,
      query: queryData.query,
      status: queryData.status || "pending",
      timestamp: queryData.timestamp || new Date().toISOString(),
    });

    cachedQueries = null;
    return { success: true, data: response.data?.data };
  } catch (error) {
    throw new Error(getErrorMessage("Failed to submit query", error));
  }
}

export async function login(credentials) {
  try {
    const response = await api.post("/auth/login", {
      username: credentials.username,
      password: credentials.password,
    });
    markLoggedIn();

    return {
      status: "success",
      message: response.data?.message || "Login successful",
    };
  } catch (error) {
    markLoggedOut();

    if (!error?.response) {
      return {
        status: "error",
        message: "Cannot reach backend. Check backend is running and CORS FRONTEND_URL matches your frontend port.",
      };
    }

    return {
      status: "error",
      message: error?.response?.data?.message || "Invalid username or password",
    };
  }
}

export async function updateQuery(queryData) {
  try {
    const response = await api.put(
      `/queries/${queryData.id}`,
      {
        answer: queryData.answer || "",
        status: queryData.status || "pending",
      }
    );

    markLoggedIn();
    cachedQueries = null;
    return { success: true, data: response.data?.data };
  } catch (error) {
    if (error?.response?.status === 401) {
      markLoggedOut();
      throw new Error("Authentication required to update queries");
    }

    throw new Error(getErrorMessage("Failed to update query", error));
  }
}

export async function deleteQuery(id) {
  try {
    await api.delete(`/queries/${id}`);

    markLoggedIn();
    cachedQueries = null;
    return { status: "success", message: "Query deleted successfully" };
  } catch (error) {
    if (error?.response?.status === 401) {
      markLoggedOut();
      throw new Error("Authentication required to delete queries");
    }

    return {
      status: "error",
      message: getErrorMessage("Failed to delete query", error),
    };
  }
}

export function isUserAuthenticated() {
  return isAuthenticated;
}

export function logout() {
  markLoggedOut();
  cachedQueries = null;
  return api
    .post("/auth/logout")
    .catch(() => ({ data: { status: "success", message: "Logout successful" } }))
    .then((response) => response.data);
}
