import chalk from 'chalk';
const color = {
  red: (message) => {
    return console.log(chalk.red(message));
  },
  green: (message) => {
    return console.log(chalk.green(message));
  },
  italic: (message) => {
    return console.log(chalk.italic(message));
  },
};
export default color;
