// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    dir: 'dist', // Directory for multiple outputs
    format: 'es', // ES module format
    manualChunks: {
      // Create a separate chunk for vendor code
      vendor: ['react', 'react-dom'],
    },
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
  ],
};