// src/state-helper.ts

import * as os from 'os';
import * as path from 'path';

// ... otro código del archivo ...

// La función ahora es pública y puede ser importada por otros archivos.
export function getDockerConfig(): string { // <-- ¡LA CORRECCIÓN CLAVE!
  const dockerConfigPath = path.join(os.homedir(), '.docker');
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dconfig = require(path.join(dockerConfigPath, 'config.json'));
    if ('auths' in dconfig) {
      return JSON.stringify(dconfig.auths, null, 2);
    }
  } catch (err) {
    // El error se captura silenciosamente, y la función continúa.
  }

  // ... lógica para cred-helpers ...

  return '';
}

// ... resto del código del archivo ...