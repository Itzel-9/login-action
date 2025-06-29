// jest.config.js

export default {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  // Usamos el preset de ts-jest optimizado para Módulos ESM con node
  preset: 'ts-jest/presets/default-esm', 
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Esta línea es crucial. Resuelve cómo Jest importa los módulos.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // Le decimos que use el transformador de ts-jest para ESM
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  verbose: true
};