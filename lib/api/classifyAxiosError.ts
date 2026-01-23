export function classifyAxiosError(error: any): {
  type: "network" | "timeout" | "http" | "unknown";
  message?: string;
  status?: number;
  data?: any;
} {
  if (!error.isAxiosError) {
    return { type: "unknown", message: "An unknown error occurred." };
  }

  if (error.code === "ECONNABORTED") {
    return { type: "timeout", message: "Request timed out." };
  }

  if (!error.response) {
    return { type: "network", message: "Network error occurred." };
  }

  return {
    type: "http",
    status: error.status,
    data: error.response.data,
  };
}
