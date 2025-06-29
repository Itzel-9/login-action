import {describe, expect, it, jest, beforeEach} from '@jest/globals';
import * as os from 'os';

jest.mock('os');

const mockedOs = os as jest.Mocked<typeof os>;

describe('getDockerConfig', () => {

  // Limpiamos la caché de módulos ANTES de cada prueba
  beforeEach(() => {
    jest.resetModules();
  });

  // PRUEBA 1: 
  it('should return the "auths" object as a formatted JSON string if it exists', () => {
    // ARRANGE
    // Preparamos nuestras simulaciones de dependencias
    mockedOs.homedir.mockReturnValue('/fake/home'); // Simulamos el directorio home

    const mockConfigFileContent = {
      auths: {
        'https://index.docker.io/v1/': {auth: 'dG9rZW4='}
      }
    };

    // Simulamos el módulo 'path' y el 'config.json' al mismo tiempo.
    // Le decimos a Jest: "Cuando alguien intente cargar el módulo 'path', dale este objeto falso.
    // Y cuando alguien intente cargar '/fake/home/.docker/config.json', dale este otro objeto falso".
    jest.doMock('path', () => ({
      join: (...args: string[]) => {
        if (args[1] === '.docker') {
          return '/fake/home/.docker';
        }
        return '/fake/home/.docker/config.json';
      }
    }));
    jest.doMock('/fake/home/.docker/config.json', () => mockConfigFileContent, {virtual: true});
    
    // ACT
    // Cargamos el módulo AHORA. Esto fuerza a que se usen nuestras simulaciones.
    const stateHelper = require('../src/state-helper.js');
    const result = stateHelper.getDockerConfig();

    // ASSERT
    const expectedJsonString = JSON.stringify(mockConfigFileContent.auths, null, 2);
    expect(result).toBe(expectedJsonString);
  });

  // PRUEBA 2: Sin la propiedad 'auths'
  it('should return an empty string if config.json exists but has no "auths" property', () => {
    // ARRANGE
    mockedOs.homedir.mockReturnValue('/fake/home');
    jest.doMock('path', () => ({ join: () => '/fake/home/.docker/config.json' }));
    jest.doMock('/fake/home/.docker/config.json', () => ({ HttpHeaders: {} }), {virtual: true});

    // ACT
    const stateHelper = require('../src/state-helper.js');
    const result = stateHelper.getDockerConfig();
    
    // ASSERT
    expect(result).toBe('');
  });

  // PRUEBA 3: El archivo no existe
  it('should return an empty string if config.json does not exist', () => {
    // ARRANGE
    mockedOs.homedir.mockReturnValue('/fake/home');
    jest.doMock('path', () => ({ join: () => '/fake/home/.docker/config.json' }));
    jest.doMock('/fake/home/.docker/config.json', () => {
      throw new Error('Cannot find module');
    }, {virtual: true});
    
    // ACT
    const stateHelper = require('../src/state-helper.js');
    const result = stateHelper.getDockerConfig();
    
    // ASSERT
    expect(result).toBe('');
  });
});