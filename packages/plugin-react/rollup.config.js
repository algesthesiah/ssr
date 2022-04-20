import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import autoExternal from 'rollup-plugin-auto-external'

const config = [
  {
    input: './src/index.ts',
    output: [
      {
        format: 'cjs',
        dir: 'lib',
      },
      {
        format: 'esm',
        plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })],
        dir: 'es',
      },
    ],
    plugins: [
      nodeResolve(),
      json(),
      commonjs(),
      autoExternal(),
      postcss(),
      typescript({ tsconfig: './tsconfig.json' }),
      babel({
        babelHelpers: 'runtime',
        exclude: ['node_modules/**'],
        plugins: ['@babel/plugin-transform-runtime'],
      }),
      terser(),
    ],
  },
]

export default config
