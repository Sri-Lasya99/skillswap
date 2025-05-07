import { QueryClient, QueryFunction } from "@tanstack/react-query";

export class ApiError extends Error {
  status: number;
  statusText: string;
  data: any;
  
  constructor(status: number, statusText: string, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
  
  // Helper method to check if this is a rate limit error
  isRateLimitError(): boolean {
    return this.status === 429 || 
          this.message.toLowerCase().includes('rate limit') || 
          this.message.toLowerCase().includes('quota');
  }
  
  // Helper method to check if this is an auth error
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    let errorData = null;
    
    try {
      // Attempt to parse the response as JSON
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorBody = await res.json();
        errorData = errorBody;
        errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
      } else {
        // If not JSON, get the text response
        errorMessage = await res.text() || res.statusText;
      }
    } catch (e) {
      // If parsing fails, use the status text
      console.error('Failed to parse error response', e);
      errorMessage = res.statusText;
    }
    
    throw new ApiError(res.status, res.statusText, errorMessage, errorData);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
