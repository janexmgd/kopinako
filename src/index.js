import inquirer from 'inquirer';
import boxen from 'boxen';
import registerAccount from './command/registerAccount.js';
import checkAccountVoucher from './command/checkVoucher.js';

const runner = async () => {
  try {
    process.stdout.write('\x1Bc');
    console.log(
      boxen(`kopinako\nmade with ♡ janexmgd`, {
        align: 'center',
        padding: 2,
      })
    );
    const choices = [
      {
        name: 'Create kopinako account & sett birthday(current date)',
        value: 1,
      },
      { name: 'Check voucher kopinako account', value: 2 },
    ];
    const { input } = await inquirer.prompt({
      type: 'list',
      message: 'select service',
      name: 'input',
      choices,
    });
    if (input == 1) {
      registerAccount();
    }
    if (input == 2) {
      checkAccountVoucher();
    }
  } catch (error) {
    console.log(error);
  }
};
export default runner;
