const { task } = require('gulp');
const fse = require('fs-extra');

// Define tasks from directory 'gulp/tasks'
const tasksPath = `${__dirname}/gulp/tasks`;

fse.readdirSync(tasksPath).forEach(function (file) {
  return require(`${tasksPath}/${file}`);
});

task('default', task('build'));
