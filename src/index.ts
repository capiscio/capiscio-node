/**
 * CapiscIO CLI Package
 * 
 * This package provides the CLI wrapper only.
 * For programmatic SDK usage, use @capiscio/sdk (coming soon).
 * 
 * @example CLI Usage
 * ```bash
 * # Install globally
 * npm install -g capiscio
 * 
 * # Validate an agent card
 * capiscio validate ./agent-card.json
 * 
 * # Issue a self-signed badge
 * capiscio badge issue --self-sign
 * ```
 */

export const version = '2.2.0';

// Re-export binary manager for advanced users who want to manage the binary
export { BinaryManager } from './utils/binary-manager';