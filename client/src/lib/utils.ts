import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { ApiError } from "./queryClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Form schemas for validation
export const skillFormSchema = z.object({
  type: z.enum(["teach", "learn"]),
  name: z.string().min(2, "Skill name must be at least 2 characters"),
  proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  description: z.string().optional(),
});

export const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
});

export const messageFormSchema = z.object({
  receiverId: z.number(),
  content: z.string().min(1, "Message cannot be empty"),
});

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Function to handle API request errors with custom error message
export function handleApiError(error: any): string {
  // Handle our ApiError class
  if (error instanceof ApiError) {
    // Rate limit errors
    if (error.isRateLimitError()) {
      return 'API rate limit exceeded. Please try again later.';
    }
    
    // Authentication errors
    if (error.isAuthError()) {
      return 'Authentication error. Please log in again.';
    }
    
    // Server errors
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    // Validation errors
    if (error.status === 400 && error.data) {
      if (typeof error.data === 'object' && error.data.errors) {
        const errorMessages = Object.values(error.data.errors).flat();
        if (errorMessages.length > 0) {
          return errorMessages.join('. ');
        }
      }
      return error.message || 'Validation error. Please check your input.';
    }
    
    // Return the error message
    return error.message || 'An error occurred with the request.';
  }
  
  // Handle regular error objects
  if (error?.message) {
    const message = error.message;
    
    // Check for specific error patterns
    if (message.includes('429') || message.toLowerCase().includes('rate limit') || 
        message.toLowerCase().includes('quota')) {
      return 'Rate limit exceeded. Please try again later.';
    }
    
    if (message.includes('401') || message.includes('403')) {
      return 'Authentication error. Please log in again.';
    }
    
    if (message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    
    return message;
  }
  
  return "An unexpected error occurred. Please try again.";
}

// Function to truncate text with ellipsis
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Utility function to convert file size to human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Function to create a custom API request
export async function customApiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: {
    processData?: boolean;
    customConfig?: RequestInit;
  }
): Promise<Response> {
  if (options?.customConfig) {
    return fetch(url, options.customConfig);
  }
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  
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
  
  return res;
}
