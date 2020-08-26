require('./gulpfile');
const gulp = require('gulp');
const args = process.argv.slice(2);
const commandOpt = args[0];

if (commandOpt === '--watch') {
    runTask('watch');
    return;
}

if (commandOpt === '--dist') {
    runTask('dist');
    return;
}

{
    runTask('buildConfig');
}

function runTask(task) {
    console.log(`gulp ${task} start`);

    gulp.task(task)(() => {
        if (task === 'watch') {
            console.log(`gulp ${task} ready`);
            return;
        }

        console.log(`gulp ${task} done`);
    });
}
