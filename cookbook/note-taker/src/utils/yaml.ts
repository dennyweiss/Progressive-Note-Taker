import YAML from 'yaml';

/**
 * Parse YAML content from an LLM response
 * Handles responses that contain YAML in code blocks
 */
export function parseYamlFromLLM<T = unknown>(response: string): T | null {
  // Try to extract YAML from code blocks first
  const yamlBlockMatch = response.match(/```ya?ml\n?([\s\S]*?)```/i);

  if (yamlBlockMatch) {
    try {
      return YAML.parse(yamlBlockMatch[1].trim()) as T;
    } catch (error) {
      console.warn('Failed to parse YAML from code block:', error);
    }
  }

  // Try to parse the entire response as YAML
  try {
    return YAML.parse(response.trim()) as T;
  } catch (error) {
    console.warn('Failed to parse response as YAML:', error);
  }

  return null;
}

/**
 * Extract a specific field from YAML in an LLM response
 */
export function extractYamlField<T = string>(
  response: string,
  fieldName: string
): T | null {
  const parsed = parseYamlFromLLM<Record<string, unknown>>(response);

  if (parsed && fieldName in parsed) {
    return parsed[fieldName] as T;
  }

  return null;
}

/**
 * Safely stringify an object to YAML
 */
export function toYaml(obj: unknown): string {
  return YAML.stringify(obj);
}
