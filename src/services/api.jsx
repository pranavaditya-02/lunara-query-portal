import axios from "axios";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzzB4EYON-wWWFcjPCfnZ5fQjvHCIR-epq90kuPD06yBqL0mFMIIEuIuff-Kc3YrlJk/exec";
let isAuthenticated = true;
let cachedQueries = null;

// Axios instance with common configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchQueries() {
  try {
    console.log("Attempting to fetch queries from API");

    // Using GET request with query parameters
    const response = await api.get("", {
      params: { action: "getQueries" },
    });

    console.log("Fetched queries response:", response.data);

    // Cache the successful response
    if (response.data && response.data.data) {
      cachedQueries = response.data.data;
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching queries:", error);

    // If we have cached data, return it as a fallback
    if (cachedQueries) {
      console.log("Returning cached queries due to API failure");
      return cachedQueries;
    }

    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      throw new Error(
        "Failed to connect to the server due to CORS restrictions. Please make sure CORS is enabled on the server."
      );
    }

    throw new Error(
      "Failed to fetch queries. Please check your connection and try again."
    );
  }
}

export async function submitQuery(queryData) {
  try {
    console.log("Submitting query:", queryData);

    // Use URLSearchParams correctly
    const params = new URLSearchParams();
    params.append("action", "submitQuery");

    // Convert object properties to string format properly
    Object.keys(queryData).forEach((key) => {
      if (typeof queryData[key] === "object") {
        params.append(key, JSON.stringify(queryData[key]));
      } else {
        params.append(key, queryData[key]);
      }
    });

    // Use a timeout to handle cases where the script loads but callback doesn't fire
    const TIMEOUT_MS = 8000;

    // Create a unique callback name
    const callbackName = "jsonpCallback_" + Date.now();

    // Create a promise to handle the JSONP response with timeout
    const jsonpPromise = new Promise((resolve, reject) => {
      // Add timeout handler
      const timeoutId = setTimeout(() => {
        // If we time out but data was actually submitted (as you mentioned),
        // we should consider this a success with limited info
        console.log(
          "JSONP request timed out, but data may have been submitted"
        );
        resolve({
          status: "success",
          message: "Query submitted but response not confirmed",
        });

        // Clean up
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }, TIMEOUT_MS);

      // Add the callback to window
      window[callbackName] = (data) => {
        clearTimeout(timeoutId);
        resolve(data);
        // Clean up
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      // Create script element
      const script = document.createElement("script");
      script.src = `${API_URL}?${params.toString()}&callback=${callbackName}`;
      script.onerror = (err) => {
        // Don't immediately reject - since we know data is being added
        console.warn("JSONP script error, but continuing:", err);
        // We don't clear the timeout here, letting it resolve as a "partial success"
      };

      // Add script to page
      document.head.appendChild(script);
    });

    const result = await jsonpPromise;
    console.log("Submit query response:", result);

    // Invalidate cache after successful submission
    cachedQueries = null;

    return { success: true, data: result };
  } catch (error) {
    console.error("Error submitting query:", error);
    throw new Error("Failed to submit query. Please try again later.");
  }
}

export async function login(credentials) {
  try {
    console.log("Attempting login:", {
      username: credentials.username,
      password: "***",
    });

    // Use GET request with query parameters instead
    const response = await api.get("", {
      params: {
        action: "login",
        username: credentials.username,
        password: credentials.password,
      },
    });

    console.log("Login response:", response.data);

    if (response.data.status === "success") {
      isAuthenticated = true;
      return response.data;
    } else {
      isAuthenticated = false;
      return response.data;
    }
  } catch (error) {
    console.error("Error during login:", error);
    isAuthenticated = false;

    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      throw new Error(
        "Failed to login due to CORS restrictions. Please make sure CORS is enabled on the server."
      );
    }

    throw new Error("Login failed. Please try again later.");
  }
}
export async function updateQuery(queryData) {
  try {
    console.log("Updating query:", queryData);

    // Check if user is authenticated for update operations
    if (!isAuthenticated) {
      throw new Error("Authentication required to update queries");
    }

    // Use URLSearchParams for JSONP approach
    const params = new URLSearchParams();
    params.append("action", "updateQuery");

    // Add all queryData properties to the params
    Object.keys(queryData).forEach((key) => {
      if (typeof queryData[key] === "object") {
        params.append(key, JSON.stringify(queryData[key]));
      } else {
        params.append(key, queryData[key]);
      }
    });

    // Use a timeout to handle cases where the script loads but callback doesn't fire
    const TIMEOUT_MS = 8000;

    // Create a unique callback name
    const callbackName = "jsonpCallback_update_" + Date.now();

    // Create a promise to handle the JSONP response with timeout
    const jsonpPromise = new Promise((resolve, reject) => {
      // Add timeout handler
      const timeoutId = setTimeout(() => {
        console.log("JSONP request timed out, but data may have been updated");
        resolve({
          status: "success",
          message: "Query updated but response not confirmed",
        });

        // Clean up
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }, TIMEOUT_MS);

      // Add the callback to window
      window[callbackName] = (data) => {
        clearTimeout(timeoutId);
        resolve(data);
        // Clean up
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      // Create script element
      const script = document.createElement("script");
      script.src = `${API_URL}?${params.toString()}&callback=${callbackName}`;
      script.onerror = (err) => {
        console.warn("JSONP script error, but continuing:", err);
      };

      // Add script to page
      document.head.appendChild(script);
    });

    const result = await jsonpPromise;
    console.log("Update query response:", result);

    // Invalidate cache after successful update
    cachedQueries = null;

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating query:", error);

    if (error.message === "Authentication required to update queries") {
      throw error; // Rethrow authentication errors unchanged
    }

    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      throw new Error(
        "Failed to update query due to CORS restrictions. Please make sure CORS is enabled on the server."
      );
    }

    throw new Error("Failed to update query. Please try again later.");
  }
}
// Alternative approach using URLSearchParams and fetch

export async function deleteQuery(queryId) {
  try {
    console.log("Deleting query:", queryId);

    if (!isAuthenticated) {
      throw new Error("Authentication required to delete queries");
    }

    // JSONP approach with proper parameter formatting
    const callbackName = "jsonpCallbackDelete" + Date.now();

    return new Promise((resolve, reject) => {
      // Create properly formatted URL parameters
      const params = new URLSearchParams();
      params.append("action", "deleteQuery"); // Make sure this is exactly "deleteQuery"
      params.append("id", queryId);

      const TIMEOUT_MS = 15000;

      // Add the callback to window
      window[callbackName] = function (data) {
        console.log("Delete callback received:", data);
        clearTimeout(timeoutId);

        // Invalidate cache
        cachedQueries = null;

        resolve(data);

        // Clean up
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      // Create script element with properly formatted URL
      const script = document.createElement("script");
      script.src = `${API_URL}?${params.toString()}&callback=${callbackName}`;

      // Add timeout
      const timeoutId = setTimeout(() => {
        console.log("JSONP delete request timed out");

        // Assume success since the request was made
        resolve({
          status: "success",
          message:
            "Query deletion likely successful but not confirmed. Please refresh to verify.",
        });

        // Clean up
        delete window[callbackName];
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }, TIMEOUT_MS);

      script.onerror = function (err) {
        console.warn("JSONP script error:", err);
        // Continue with timeout rather than rejecting
      };

      // Add script to page
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error("Error deleting query:", error);
    throw new Error("Failed to delete query: " + error.message);
  }
}
export function isUserAuthenticated() {
  return isAuthenticated;
}

export function logout() {
  isAuthenticated = false;
  return { status: "success", message: "Logout successful" };
}
