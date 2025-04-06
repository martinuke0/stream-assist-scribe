
export interface ApiConfig {
  endpoint: string;
  model: string;
  apiKey?: string;  // Optional API key for authentication
}

const defaultConfig: ApiConfig = {
  endpoint: 'http://localhost:8765/chat/completions',
  model: 'gpt-3.5-turbo',
  apiKey: undefined  // You can set this if your endpoint requires authentication
};

// Function to update the configuration
export function updateApiConfig(newConfig: Partial<ApiConfig>): ApiConfig {
  return { ...defaultConfig, ...newConfig };
}

// Export the current configuration
export const apiConfig = { ...defaultConfig };
