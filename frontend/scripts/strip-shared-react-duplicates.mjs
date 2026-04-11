/**
 * packages/shared npm ci sonrası react / react-query / react-dom nested kopyalarını siler.
 * Aksi halde tarayıcıda iki farklı @tanstack/react-query örneği → "No QueryClient set".
 */
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedModules = path.resolve(__dirname, '../../packages/shared/node_modules');

for (const name of ['@tanstack', 'react', 'react-dom', 'use-sync-external-store']) {
  const target = path.join(sharedModules, name);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}
