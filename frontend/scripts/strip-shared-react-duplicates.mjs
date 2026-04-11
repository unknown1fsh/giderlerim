/**
 * packages/shared/node_modules dizinini tamamen siler.
 * Tüm bağımlılıklar frontend/node_modules'dan çözümlenir; çift modül riski sıfırlanır.
 */
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedModules = path.resolve(__dirname, '../../packages/shared/node_modules');

if (existsSync(sharedModules)) {
  rmSync(sharedModules, { recursive: true, force: true });
}
