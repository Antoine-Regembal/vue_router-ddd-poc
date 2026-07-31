/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-deep-cross-module-imports',
      comment:
        'A module can only be consumed from another module through its index.ts or mocks.ts',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/.+' },
      to: { path: '^src/modules/(?!$1/)[^/]+/(?!(index|mocks)\\.ts$).+' },
    },
    {
      name: 'no-deep-external-module-imports',
      comment:
        "Code outside src/modules can only consume a module through its index.ts or mocks.ts",
      severity: 'error',
      from: { pathNot: '^src/modules/' },
      to: { path: '^src/modules/[^/]+/(?!(index|mocks)\\.ts$).+' },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.app.json' },
    doNotFollow: { path: 'node_modules' },
  },
};
