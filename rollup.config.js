import ts from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import tsconfig from './tsconfig.json' assert { type: 'json' }

const tsPlugin = ts({
  compilerOptions: tsconfig.compilerOptions,
  noForceEmit: true,
})

const dtsPlugin = dts()

const packages = [
  'react',
  'vue',
]

/**
 * @type {import('rollup').RollupOptions[]}
 */
const rollupOptions = []

for (const name of packages) {
  const pkgDir = `./packages/${name}`
  const outDir = `${pkgDir}/dist`
  const input = `${pkgDir}/src/index.ts`

  rollupOptions.push({
      input,
      output: [
        {
          format: 'es',
          file: `${outDir}/index.mjs`,
        },
        {
          format: 'cjs',
          file: `${outDir}/index.cjs`,
        }
      ],
      plugins: [tsPlugin],
    },
    {
      input,
      output: {
        format: 'es',
        file: `${outDir}/index.d.ts`,
      },
      plugins: [dtsPlugin],
    })
}

export default rollupOptions