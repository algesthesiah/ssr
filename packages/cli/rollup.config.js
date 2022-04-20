import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import autoExternal from 'rollup-plugin-auto-external'
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs'

const config = [
  {
    input: './src/cli.ts',
    output: [
      {
        format: 'cjs',
        dir: 'bin',
      },
    ],
    external: [id => id.includes('@babel/runtime')],
    plugins: [
      preserveShebangs(),
      nodeResolve(),
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
