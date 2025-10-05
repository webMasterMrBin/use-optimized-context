/** @type {import('rollup').RollupOptions} */
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');

module.exports = {
	input: 'src/index.ts',
	output: {
		file: 'dist/index.js',
		format: 'esm'
	},
  external: [
		'react',
		'react-dom'
	],
	plugins: [
		babel({
      babelHelpers: 'bundled', // 将Babel的辅助函数打包进输出文件
      exclude: 'node_modules/**', // 排除node_modules
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // 要处理的文件扩展名
      presets: [
        ['@babel/preset-env', 
					{
						"targets": {
							"browsers": ["last 2 versions", "not dead", "> 0.5%"],
							"node": "current"
						},
						"modules": false
					}
				],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ],
    }),
		terser(),
	]
};
