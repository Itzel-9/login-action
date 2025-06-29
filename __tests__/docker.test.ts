import {describe, expect, it, jest, beforeEach} from '@jest/globals';
import * as core from '@actions/core';
import {Docker} from '@docker/actions-toolkit/lib/docker/docker';
import {ExecOutput} from '@actions/exec'; // Importamos el tipo de la respuesta

jest.mock('@actions/core');

const mockedCore = core as jest.Mocked<typeof core>;

describe('loginStandard', () => {
  const originalGetExecOutput = Docker.getExecOutput;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restauramos el método original
    Docker.getExecOutput = originalGetExecOutput;
  });

  it('should throw an error if username is not provided', async () => {
    const { loginStandard } = require('../src/docker.js');
    await expect(loginStandard('my-registry', '', 'my-password')).rejects.toThrow('Username required');
  });

  it('should throw an error if password is not provided', async () => {
    const { loginStandard } = require('../src/docker.js');
    await expect(loginStandard('my-registry', 'my-user', '')).rejects.toThrow('Password required');
  });

  // PRUEBA 3: El "camino feliz", con tipos explícitos
  it('should call docker login with correct arguments when all inputs are valid', async () => {
    // ARRANGE
    const { loginStandard } = require('../src/docker.js');
    const registry = 'docker.io';
    const username = 'testuser';
    const password = 'testpassword';
    
    // 1. Creamos el objeto de respuesta con su tipo correcto.
    const mockResponse: ExecOutput = {
      stdout: 'Login Succeeded',
      stderr: '',
      exitCode: 0
    };

    // 2. Creamos la función simulada y le damos su tipo explícito.
    const mockExec = jest.fn<typeof Docker.getExecOutput>().mockResolvedValue(mockResponse);

    // 3. Hacemos el "monkey-patch". Ahora los tipos coinciden.
    Docker.getExecOutput = mockExec;

    // ACT
    await loginStandard(registry, username, password);

    // ASSERT
    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockExec).toHaveBeenCalledWith(
      ['login', '--password-stdin', '--username', username, registry],
      expect.objectContaining({
        input: Buffer.from(password)
      })
    );
    expect(mockedCore.info).toHaveBeenCalledWith(`Logging into ${registry}...`);
    expect(mockedCore.info).toHaveBeenCalledWith('Login Succeeded!');
  });
  describe('logout', () => {
  // Usamos la misma técnica de "monkey-patching"
  const originalGetExecOutput = Docker.getExecOutput;
  let mockExec;

  beforeEach(() => {
    jest.clearAllMocks();
    // Creamos una nueva función mock para cada prueba
    mockExec = jest.fn();
    Docker.getExecOutput = mockExec;
  });

  afterEach(() => {
    // Restauramos el método original
    Docker.getExecOutput = originalGetExecOutput;
  });

  // PRUEBA 1: El camino feliz para logout
  it('should call docker logout with the correct registry', async () => {
    // ARRANGE
    const { logout } = require('../src/docker.js');
    const registry = 'my.private.registry.com';
    
    // Simulamos una ejecución exitosa (sin errores)
    mockExec.mockResolvedValue({
      stdout: 'Removing login credentials for my.private.registry.com',
      stderr: '',
      exitCode: 0
    });

    // ACT
    await logout(registry);

    // ASSERT
    // Verificamos que se llamó al comando correcto
    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockExec).toHaveBeenCalledWith(['logout', registry], expect.any(Object));
    
    // Verificamos que NO se llamó a core.warning, porque no hubo error
    expect(mockedCore.warning).not.toHaveBeenCalled();
  });

  // PRUEBA 2: El camino del error para logout
  it('should call core.warning if logout fails', async () => {
    // ARRANGE
    const { logout } = require('../src/docker.js');
    const registry = 'my.private.registry.com';
    const errorMessage = 'ERROR: not logged in to my.private.registry.com';
    
    // Simulamos una ejecución fallida
    mockExec.mockResolvedValue({
      stdout: '',
      stderr: errorMessage,
      exitCode: 1
    });

    // ACT
    await logout(registry);

    // ASSERT
    // Verificamos que se llamó al comando correcto
    expect(mockExec).toHaveBeenCalledTimes(1);
    expect(mockExec).toHaveBeenCalledWith(['logout', registry], expect.any(Object));

    // Verificamos que SÍ se llamó a core.warning con el mensaje de error
    expect(mockedCore.warning).toHaveBeenCalledTimes(1);
    expect(mockedCore.warning).toHaveBeenCalledWith(errorMessage);
  });
});
}
);