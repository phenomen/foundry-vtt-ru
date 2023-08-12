import path from 'node:path';

const config = {
	root: 'src/',
	base: '/modules/ru-ru/',
	publicDir: path.resolve(__dirname, 'public'),
	build: {
		outDir: path.resolve(__dirname, 'ru-ru'),
		minify: true,
		emptyOutDir: true,
		sourcemap: false,
		brotliSize: true,
		lib: {
			name: 'ru-ru',
			entry: path.resolve(__dirname, 'src/index.js'),
			formats: ['es'],
			fileName: 'ru-ru'
		},
		rollupOptions: {
			external: [/^.\/fonts\/*/]
		}
	}
};

export default config;
