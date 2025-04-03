const API_URL = "https://script.google.com/macros/s/AKfycbyrxzppHr6LiH9Dey2MucarNgY7dLfU-RScou-_2e_4j1hf0S8fyCklGcwgPoO52KPR/exec";

const useMockData = true;
let isAuthenticated = false;

const mockQueries = [
  {
    id: "1",
    name: "John Doe",
    query: "What time does the Lunara event start?",
    answer: "The event starts at 10:00 AM on Saturday, May 15th.",
    status: "resolved",
    timestamp: "2023-05-10T08:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    query: "Is there a dress code for the event?",
    answer: null,
    status: "pending",
    timestamp: "2023-05-11T14:45:00Z",
  },
  {
    id: "3",
    name: "Alex Johnson",
    query: "Can I bring a guest to the event?",
    answer: null,
    status: "pending",
    timestamp: "2023-05-12T09:15:00Z",
  },
  {
    id: "4",
    name: "Sarah Williams",
    query: "Where can I find the schedule for the workshops?",
    answer: "The workshop schedule will be emailed to all registered participants 3 days before the event.",
    status: "resolved",
    timestamp: "2023-05-09T11:20:00Z",
  },
  {
    id: "5",
    name: "Michael Brown",
    query: "Are there any vegetarian food options available?",
    answer: "Yes, we will have a variety of vegetarian options at all meal times.",
    status: "resolved",
    timestamp: "2023-05-08T16:20:00Z",
  },
  {
    id: "6",
    name: "Emily Davis",
    query: "Is there parking available at the venue?",
    answer: null,
    status: "pending",
    timestamp: "2023-05-13T10:30:00Z",
  },
  {
    id: "7",
    name: "David Wilson",
    query: "Will the presentations be recorded?",
    answer: "Yes, all presentations will be recorded and made available to attendees after the event.",
    status: "resolved",
    timestamp: "2023-05-07T13:45:00Z",
  },
  {
    id: "8",
    name: "Sophia Martinez",
    query: "Is there a mobile app for the event?",
    answer: null,
    status: "pending",
    timestamp: "2023-05-14T09:00:00Z",
  },
]
export async function fetchQueries() {
  try {
    if (!isAuthenticated && !useMockData) {
      throw new Error("Authentication required");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (useMockData) {
      return mockQueries;
    }

    const response = await fetch(`${API_URL}?action=getQueries`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
    });

    console.log("Fetched queries response:", response);
    return [];
  } catch (error) {
    console.error("Error fetching queries:", error);
    throw new Error("Failed to fetch queries. Please try again.");
  }
}

export async function submitQuery(queryData) {
  try {
    console.log("Submitting query:", queryData);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (useMockData) {
      const newQuery = {
        id: String(mockQueries.length + 1),
        name: queryData.name,
        query: queryData.query,
        answer: null,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      mockQueries.push(newQuery);
      return { success: true, data: newQuery };
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitQuery", ...queryData }),
      mode: "no-cors",
    });

    console.log("Submit query response:", response);
    return { success: true };
  } catch (error) {
    console.error("Error submitting query:", error);
    throw new Error("Failed to submit query. Please try again.");
  }
}

export async function login(credentials) {
  try {
    console.log("Attempting login:", { username: credentials.username, password: "***" });
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (useMockData) {
      if (credentials.username === "admin" && credentials.password === "admin123") {
        isAuthenticated = true;
        return { status: "success", message: "Login successful" };
      } else {
        isAuthenticated = false;
        return { status: "error", message: "Invalid credentials" };
      }
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        username: credentials.username,
        password: credentials.password,
      }),
      mode: "no-cors",
    });

    console.log("Login response:", response);
    isAuthenticated = true;
    return { status: "success" };
  } catch (error) {
    console.error("Error during login:", error);
    isAuthenticated = false;
    throw new Error("Login failed. Please try again.");
  }
}
export const updateQuery = async (queryId, updatedData) => {
  const response = await fetch(`/update-query/${queryId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update query");
  }

  return await response.json();
};

export function isUserAuthenticated() {
  return isAuthenticated;
}

export function logout() {
  isAuthenticated = false;
  return { status: "success", message: "Logout successful" };
}