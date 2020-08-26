const moment = require('moment');
const path = require('path');
const gulp = require('gulp');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const iconfont = require('gulp-iconfont');
const iconfontCss = require('gulp-iconfont-css');

const buildTasks = [];
const distTasks = [];
const watchTasks = [];

{
    buildTasks.push(buildIconfont);
    distTasks.push(distIconfont);
    watchTasks.push(watchIconfont);

    const rootDir = path.resolve(__dirname, '../../../');
    const mainDir = path.resolve(rootDir, 'frontend/src/main');
    const bundlesDir = path.resolve(rootDir, 'public/themes/qc4a/bundles/');

    const fontName = 'iconfont';
    const cssClass = 'icon';
    const svgIconsRelative = 'icons/**/*.svg';
    const svgIcons = path.resolve(mainDir, svgIconsRelative);
    const fontDir = path.resolve(bundlesDir, `${fontName}/`);
    const cssFilePath = path.resolve(bundlesDir, `${fontName}.css`);
    const cssMinDir = path.resolve(bundlesDir, `./`);
    const timestamp = Math.round(Date.now() / 1000);

    function buildIconfont(done) {
        gulp.src(svgIcons)
            .pipe(iconfontCss({
                targetPath: `../${fontName}.css`,
                fontName,
                fontPath: fontName + '/',
                timestamp,
                cssClass
            }))
            .pipe(iconfont({
                fontName,
                fontHeight: 10000,
                formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
                normalize: true,
                timestamp
            }))
            .pipe(gulp.dest(fontDir))
            .on('end', () => {
                console.log('---> ' + path.resolve(fontDir, '*'));
                console.log('     ' + cssFilePath);
                done();
            });
    }

    function distIconfont(done) {
        const minFileName = `${fontName}.min.css`;

        buildIconfont(() => {
            gulp.src(cssFilePath)
                .pipe(cleanCSS())
                .pipe(rename(minFileName))
                .pipe(gulp.dest(cssMinDir))
                .on('end', () => {
                    console.log(`     ` + path.resolve(cssMinDir, minFileName));
                    done();
                });
        });
    }

    function watchIconfont(done) {
        buildIconfont(() => {
            gulp.watch(svgIconsRelative, {cwd: mainDir})
                .on('change', () => {
                    console.log('[' + moment().format('hh:mm:ss') + '] gulp is watching...');
                    buildIconfont(() => {
                    });
                });
            done();
        });
    }
}

gulp.task('buildConfig', gulp.parallel(...buildTasks));
gulp.task('dist', gulp.parallel(...distTasks));
gulp.task('watch', gulp.parallel(...watchTasks));