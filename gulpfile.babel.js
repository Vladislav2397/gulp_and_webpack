import { src, dest, watch, series, parallel } from 'gulp'
import gulpIf from 'gulp-if'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import webpackStream from 'webpack-stream'
import browserSync from 'browser-sync'
import del from 'del'

import pug from 'gulp-pug'
import sass from 'gulp-sass'
import cleanCSS from 'gulp-clean-css'
import sourcemaps from 'gulp-sourcemaps'
import autoprefixer from 'gulp-autoprefixer'

import webpackConfig from './webpack.config'

let isDev = process.env.NODE_ENV === 'development'
let files = {
	src: './src/',
	dist: './dist/',
	all: './src/**/*',
	mainStyle: './src/styles/style.scss',
	allStyles: './src/styles/**/*.scss',
	mainScript: './src/scripts/index.js',
	allScripts: './src/scripts/**/*.js',
	allPages: './src/templates/pages/*.pug',
	allTemplates: './src/templates/**/*.pug'
}

console.log("Mode is", isDev ? "Development" : "Production")

function clear(done) {
	del.sync('dist')
	done()
}

function serve() {
	browserSync.init({
		server: "dist"
	})
	watch(files.allStyles, compiler_SCSS)
	watch(files.allTemplates, compiler_PUG)
	watch(files.allScripts, compiler_JS)
	watch(files.all).on('change', browserSync.reload)
}

function compiler_PUG(done) {
	src(files.allPages)
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: "Ошибка в CSS",
					message: "<%= error.message %>"
				})(err);
			}
		}))
		.pipe(pug({ pretty: true }))
		.pipe(dest('dist'))
	done()
}

function compiler_SCSS(done) {
	src(files.mainStyle)
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: "Ошибка в CSS",
					message: "<%= error.message %>"
				})(err);
			}
		}))
		.pipe(gulpIf(isDev, sourcemaps.init()))
		.pipe(sass({ outputStyle: "compressed" }))
		.pipe(autoprefixer())
		.pipe(gulpIf(isDev, cleanCSS({level: 2})))
		.pipe(gulpIf(isDev, sourcemaps.write()))
		.pipe(dest('dist/public/css'))
	done()
}

function compiler_JS(done) {
	src(files.mainScript)
		.pipe(plumber({
			errorHandler: function(err) {
				notify.onError({
					title: "Ошибка в CSS",
					message: "<%= error.message %>"
				})(err);
			}
		}))
		.pipe(webpackStream(webpackConfig))
		.pipe(dest('dist/public/js/'))
	done()
}

const build = series(
	clear,
	parallel(
		compiler_PUG,
		compiler_SCSS,
		compiler_JS,
	)
)

const dev = series(
	build,
	parallel(
		serve
	)
)

export {
	dev as dev,
	build as build
}