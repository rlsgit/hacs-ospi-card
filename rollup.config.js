import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import multi from '@rollup/plugin-multi-entry'

const dev = process.env.ROLLUP_WATCH

export default {
	input: ['src/**/*.ts'],
	output: {
		file: 'dist/ospi-cards.js',
		format: 'es'
	},
	plugins: [
		nodeResolve(),
		commonjs(),
		json(),
		typescript(),
		babel({
			exclude: 'node_modules/**'
		}),
		!dev && terser({ format: { comments: false } }),
		multi()
	]
}
