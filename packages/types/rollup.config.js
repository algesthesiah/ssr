import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import resolve from '@rollup/plugin-node-resolve' // 帮助寻找 node_modules 里的包
import postcss from 'rollup-plugin-postcss'

const config = [
  {
    input: './src/index.ts',
    output: [
      {
        format: 'umd',
        dir: 'lib',
        name: 'cssr-types',
      },
      {
        format: 'es',
        dir: 'es',
      },
    ],
    external: [id => id.includes('@babel/runtime')],
    plugins: [resolve(), commonjs(), postcss(), typescript({ tsconfig: './tsconfig.json' }), terser()],
  },
]

export default config
