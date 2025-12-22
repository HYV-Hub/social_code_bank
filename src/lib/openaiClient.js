import OpenAI from 'openai';

/**
 * Safely initializes the OpenAI client with error handling
 * @returns {OpenAI|null} Configured OpenAI client instance or null if initialization fails
 */
let openai = null;
let initializationError = null;

try {
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    initializationError = 'OpenAI API key is not configured properly';
  } else {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage in React
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
  initializationError = error?.message || 'Failed to initialize OpenAI client';
}

/**
 * Check if OpenAI is available and properly configured
 * @returns {Object} Status object with isAvailable flag and message
 */
export function isOpenAIAvailable() {
  if (initializationError) {
    return {
      isAvailable: false,
      message: initializationError
    };
  }
  
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      isAvailable: false,
      message: 'OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.'
    };
  }
  
  if (apiKey === 'your-openai-api-key-here') {
    return {
      isAvailable: false,
      message: 'OpenAI API key is not set. Please replace the placeholder with your actual API key in .env file.'
    };
  }
  
  if (!openai) {
    return {
      isAvailable: false,
      message: 'OpenAI client failed to initialize. Please check your API key and try restarting the application.'
    };
  }
  
  return {
    isAvailable: true,
    message: 'OpenAI is properly configured.'
  };
}

/**
 * Safe wrapper for OpenAI API calls with error handling
 * @param {Function} apiCall - The OpenAI API call function to execute
 * @param {string} operationName - Name of the operation for error messages
 * @returns {Promise<Object>} Result object with success flag and data or error
 */
export async function safeOpenAICall(apiCall, operationName = 'OpenAI operation') {
  try {
    // Check if OpenAI is available first
    const availability = isOpenAIAvailable();
    if (!availability?.isAvailable) {
      return {
        success: false,
        error: availability?.message,
        isConfigError: true
      };
    }
    
    // Execute the API call
    const result = await apiCall();
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    
    // Categorize the error
    let errorMessage = 'An unexpected error occurred.';
    let isConfigError = false;
    
    if (error?.status === 401) {
      errorMessage = 'Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY in .env file.';
      isConfigError = true;
    } else if (error?.status === 429) {
      errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
    } else if (error?.status === 500 || error?.status === 503) {
      errorMessage = 'OpenAI service is temporarily unavailable. Please try again later.';
    } else if (error?.message?.includes('fetch')) {
      errorMessage = 'Unable to connect to OpenAI service. Please check your internet connection.';
    } else if (error?.message) {
      errorMessage = error?.message;
    }
    
    return {
      success: false,
      error: errorMessage,
      isConfigError,
      originalError: error
    };
  }
}

export default openai;