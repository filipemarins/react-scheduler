import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import autoExternal from 'rollup-plugin-auto-external';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { terser } from 'rollup-plugin-terser';

import project from './package.json';

const name = 'ReactBigCalendar';
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

const babelOptions = {
  exclude: /node_modules/,
  babelHelpers: 'runtime',
};

const commonjsOptions = {
  include: /node_modules/,
};

export default [
  {
    input: './src/index.js',
    output: {
      file: './dist/react-scheduler.js',
      format: 'umd',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      autoExternal(),
      resolve(),
      babel({ ...babelOptions, plugins: ['@babel/plugin-transform-runtime'] }),
      commonjs(commonjsOptions),
      replace({ __buildEnv__: 'development' }),
      sizeSnapshot(),
    ],
  },

  {
    input: './src/index.js',
    output: {
      file: './dist/react-scheduler.min.js',
      format: 'umd',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      autoExternal(),
      resolve(),
      babel({ ...babelOptions, plugins: ['@babel/plugin-transform-runtime'] }),
      commonjs(commonjsOptions),
      replace({ __buildEnv__: 'production' }),
      sizeSnapshot(),
      terser(),
    ],
  },
  {
    input: './src/index.js',
    output: { file: project.main, format: 'cjs' },
    plugins: [
      autoExternal(),
      babel({ ...babelOptions, babelHelpers: 'bundled' }),
      resolve(),
      commonjs(commonjsOptions),
      sizeSnapshot(),
    ],
  },
  {
    input: './src/index.js',
    output: { file: project.module, format: 'es' },
    plugins: [
      autoExternal(),
      babel({ ...babelOptions, babelHelpers: 'bundled' }),
      resolve(),
      commonjs(commonjsOptions),
      sizeSnapshot(),
    ],
  },
];
