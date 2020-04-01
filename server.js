require('dotenv').config({path: 'config.env'});
const {PORT} = process.env;
const chalk = require('chalk');

process.on('uncaughtException', err => {
  console.log(chalk.blue(err.name, err.message));
  console.log(chalk.cyan('Uncaught Exception! ') + chalk.gray('SHUTTING DOWN...'));
  process.exit(1);
});

const app = require('./app');
const port = PORT || 3000;

const server = app.listen(port, () => console.log(`Hello From Port ${port}`));

process.on('unhandledRejection', err => {
  console.log(chalk.blue(err.name, err.message));
  console.log(chalk.cyan('Unhandled Rejection! ') + chalk.gray('SHUTTING DOWN...'));
  server.close(() => {
    process.exit(1); // 0 FOR SUCCESS & 1 FOR UNHANDLED SO CRASHED
  });
});


