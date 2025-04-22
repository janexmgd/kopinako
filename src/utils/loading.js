import chalk from 'chalk';

export default function showLoading(message, colorFn = chalk.blue) {
  let dots = '';
  const interval = setInterval(() => {
    dots += '.';
    if (dots.length > 3) dots = '';
    process.stdout.write('\x1b[2K\r'); // Clear current line
    process.stdout.write(colorFn(`${message}${dots}`));
  }, 500);

  return () => {
    clearInterval(interval);
    process.stdout.write('\x1b[2K\r'); // Clear loading line when stopped
  };
}
