import { LLMConfig, defaultConfig } from '../types.js';

/**
 * Options for LLM calls
 */
export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Global LLM configuration (set once at startup)
 */
let globalConfig: LLMConfig = defaultConfig.llm;

/**
 * Set the global LLM configuration
 */
export function setLLMConfig(config: Partial<LLMConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the current LLM configuration
 */
export function getLLMConfig(): LLMConfig {
  return globalConfig;
}

/**
 * Call the configured LLM with a prompt
 */
export async function callLlm(
  prompt: string,
  options?: LLMOptions
): Promise<string> {
  const config = globalConfig;
  const temperature = options?.temperature ?? config.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? config.maxTokens ?? 4096;

  switch (config.provider) {
    case 'openai':
      return callOpenAI(prompt, { ...options, temperature, maxTokens });
    case 'anthropic':
      return callAnthropic(prompt, { ...options, temperature, maxTokens });
    case 'ollama':
      return callOllama(prompt, { ...options, temperature, maxTokens });
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  prompt: string,
  options: LLMOptions & { temperature: number; maxTokens: number }
): Promise<string> {
  const apiKey = globalConfig.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable or configure in LLMConfig.');
  }

  const baseUrl = globalConfig.baseUrl || 'https://api.openai.com/v1';

  const messages: Array<{ role: string; content: string }> = [];

  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: globalConfig.model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || '';
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  prompt: string,
  options: LLMOptions & { temperature: number; maxTokens: number }
): Promise<string> {
  const apiKey = globalConfig.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable or configure in LLMConfig.');
  }

  const baseUrl = globalConfig.baseUrl || 'https://api.anthropic.com/v1';

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: globalConfig.model,
      max_tokens: options.maxTokens,
      system: options.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const textContent = data.content.find((c) => c.type === 'text');
  return textContent?.text || '';
}

/**
 * Call Ollama API (local)
 */
async function callOllama(
  prompt: string,
  options: LLMOptions & { temperature: number; maxTokens: number }
): Promise<string> {
  const baseUrl = globalConfig.baseUrl || 'http://localhost:11434';

  const fullPrompt = options.systemPrompt
    ? `${options.systemPrompt}\n\n${prompt}`
    : prompt;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: globalConfig.model,
      prompt: fullPrompt,
      stream: false,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as { response: string };
  return data.response || '';
}
