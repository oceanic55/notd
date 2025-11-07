// LLM API Abstraction Layer
// Unified interface for multiple LLM providers (Groq, OpenAI, Anthropic)

const LLMAPI = {
  // Provider configuration
  providers: {
    groq: {
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      format: 'openai'
    },
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      format: 'openai'
    },
    anthropic: {
      endpoint: 'https://api.anthropic.com/v1/messages',
      format: 'anthropic'
    }
  },
  
  /**
   * Send chat request to LLM provider
   * @param {Object} options - Request options
   * @param {string} options.provider - Provider name ('groq', 'openai', 'anthropic')
   * @param {string} options.apiKey - API key for the provider
   * @param {string} options.model - Model name
   * @param {Array} options.messages - Array of message objects with role and content
   * @param {number} options.temperature - Temperature setting (optional)
   * @param {number} options.maxTokens - Max tokens setting (optional)
   * @returns {Promise<Object>} Normalized response with text, usage, finishReason, isComplete
   */
  async sendChatRequest(options) {
    const {
      provider = 'groq',
      apiKey,
      model,
      messages,
      temperature = 0.7,
      maxTokens = 500
    } = options;
    
    // Validate provider
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Validate API key
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    // Format request based on provider
    let requestBody;
    if (providerConfig.format === 'openai') {
      requestBody = this.formatOpenAICompatibleRequest({
        model,
        messages,
        temperature,
        maxTokens
      });
    } else if (providerConfig.format === 'anthropic') {
      requestBody = this.formatAnthropicRequest({
        model,
        messages,
        temperature,
        maxTokens
      });
    }
    
    // Make API call
    const response = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers: this.getHeaders(provider, apiKey),
      body: JSON.stringify(requestBody)
    });
    
    // Handle errors
    if (!response.ok) {
      throw await this.handleAPIError(response, provider);
    }
    
    // Parse and normalize response
    const data = await response.json();
    return this.normalizeResponse(data, providerConfig.format);
  },
  
  /**
   * Get headers for provider
   * @param {string} provider - Provider name
   * @param {string} apiKey - API key
   * @returns {Object} Headers object
   */
  getHeaders(provider, apiKey) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    // Anthropic uses different header format
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      delete headers['Authorization'];
    }
    
    return headers;
  },
  
  /**
   * Format request for OpenAI-compatible providers (Groq, OpenAI)
   * @param {Object} options - Request options
   * @returns {Object} Formatted request body
   */
  formatOpenAICompatibleRequest(options) {
    return {
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens
    };
  },
  
  /**
   * Format request for Anthropic
   * @param {Object} options - Request options
   * @returns {Object} Formatted request body
   */
  formatAnthropicRequest(options) {
    // Anthropic separates system message from other messages
    const systemMessage = options.messages.find(m => m.role === 'system');
    const otherMessages = options.messages.filter(m => m.role !== 'system');
    
    const body = {
      model: options.model,
      messages: otherMessages,
      temperature: options.temperature,
      max_tokens: options.maxTokens
    };
    
    // Add system message if present
    if (systemMessage) {
      body.system = systemMessage.content;
    }
    
    return body;
  },
  
  /**
   * Normalize response from different providers into consistent format
   * @param {Object} data - Raw API response
   * @param {string} format - Provider format ('openai' or 'anthropic')
   * @returns {Object} Normalized response
   */
  normalizeResponse(data, format) {
    if (format === 'openai') {
      // OpenAI and Groq use same format
      return {
        text: data.choices?.[0]?.message?.content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        finishReason: data.choices?.[0]?.finish_reason || 'unknown',
        isComplete: data.choices?.[0]?.finish_reason === 'stop'
      };
    } else if (format === 'anthropic') {
      // Anthropic uses different field names
      return {
        text: data.content?.[0]?.text || '',
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        },
        finishReason: data.stop_reason || 'unknown',
        isComplete: data.stop_reason === 'end_turn'
      };
    }
    
    // Fallback for unknown format
    return {
      text: '',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: 'unknown',
      isComplete: false
    };
  },
  
  /**
   * Handle API errors and normalize error messages
   * @param {Response} response - Fetch response object
   * @param {string} provider - Provider name
   * @returns {Promise<Error>} Normalized error
   */
  async handleAPIError(response, provider) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      return new Error(`${provider} API error: ${response.statusText}`);
    }
    
    const errorMessage = errorData.error?.message || errorData.message || 'API request failed';
    
    // Detect rate limiting
    if (response.status === 429 || errorMessage.toLowerCase().includes('rate limit')) {
      return new Error(`Rate limit reached for ${provider}. Please try again later or switch to a different model.`);
    }
    
    // Detect authentication errors
    if (response.status === 401 || response.status === 403) {
      return new Error(`Authentication failed for ${provider}. Please check your API key.`);
    }
    
    // Generic error with provider context
    return new Error(`${provider} API error: ${errorMessage}`);
  }
};

// Export for use in other modules
window.LLMAPI = LLMAPI;
if (window.NOTD_MODULES) window.NOTD_MODULES.LLMAPI = LLMAPI;
