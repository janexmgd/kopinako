import 'dotenv/config';
import inquirer from 'inquirer';
import { register, settAccount, validateRegister } from './func/nako.js';
import path from 'path';
import fs from 'fs';
import boxen from 'boxen';
import color from './utils/color.js';
import { faker } from '@faker-js/faker';
import {
  changeStatus,
  checkCode,
  getBalance,
  orderNum,
  // setMaxPrice,
} from './func/smshub.js';
import chalk from 'chalk';
import showLoading from './utils/loading.js';
const randomYear = () => {
  const currentDate = new Date();
  const randomYear = Math.floor(Math.random() * (2004 - 2000 + 1)) + 2000;
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${randomYear}-${month}-${day}`;
};

let stopLoading;

(async () => {
  try {
    process.stdout.write('\x1Bc');
    console.log(
      boxen(`nako register and set birthday\nmade with love janexmgd`, {
        align: 'center',
        padding: 2,
      })
    );
    const { SMSHUB_APIKEY } = process.env;
    if (!SMSHUB_APIKEY) {
      return color.red('Please set the SMSHUB_APIKEY environment variable.');
    }
    let manyAccounts = await inquirer
      .prompt({
        type: 'number',
        message: 'how many account you want ?',
        name: 'manyAccounts',
      })
      .then((answers) => {
        return answers.manyAccounts;
      });
    let i = 1;
    while (i <= manyAccounts) {
      try {
        await getBalance();
        const MAX_WAIT_TIME = 30000;
        const CHECK_INTERVAL = 3000;
        const { orderid, number } = await orderNum();
        let phoneNum = number.replace(/^62/, '+62');
        let id = orderid;
        let totalTimeWaited = 0;
        let code;

        const nameAccount = faker.internet.username();
        const email = faker.internet.email(nameAccount);
        const password = 'Bismillah123';
        const refferal_code = process.env.REFERRAL_CODE;

        await validateRegister(
          nameAccount,
          phoneNum,
          password,
          email,
          refferal_code
        );
        while (totalTimeWaited <= MAX_WAIT_TIME) {
          if (totalTimeWaited == 0) {
            // color.info(`checking otp...`);
            stopLoading = showLoading('Checking OTP');
          }
          // color.italic(`WAITING OTP ${totalTimeWaited}ms`);
          await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
          code = await checkCode(id);
          if (code != undefined) {
            // color.warning(`changing status order ${id}`);
            const status = await changeStatus(id, '6');
            stopLoading();
            // color.info(`status order id ${id} ${status}`);
            break;
          }
          totalTimeWaited += CHECK_INTERVAL;
          if (totalTimeWaited >= MAX_WAIT_TIME) {
            // console.log(`changing status order ${color.warning(id)}`);
            const status = await changeStatus(id, '8');
            stopLoading();
            // color.info(`status order id ${id} ${status}`);
            let isOrderagain = true;
            if (isOrderagain) {
              const { orderid, number } = await orderNum();
              phoneNum = number.replace(/^62/, '+62');
              await validateRegister(
                nameAccount,
                phoneNum,
                password,
                email,
                refferal_code
              );
              id = orderid;
              totalTimeWaited = 0;
              continue;
            }
            color.red(`failed obtain otp at 3 chance`);
            break;
          }
        }
        if (!code) {
          throw 'no otp';
        }

        const otp = code.split('.')[0].split(' ')[8];
        console.log(`OTP : ${chalk.green(otp)}`);

        const doingRegister = await register(
          nameAccount,
          phoneNum,
          password,
          email,
          refferal_code,
          otp
        );

        const session = doingRegister.headers.session_key;
        // console.log(JSON.stringify(doingRegister.data.user));
        const filePath = path.join(process.cwd(), 'result.txt');
        if (!fs.existsSync(filePath)) {
          color.info(`Creating file ${filePath}`);
          fs.open(filePath, 'w', (err) => {
            if (err) {
              throw err;
            }
            color.green('success creating file');
          });
        }
        const result = `${phoneNum} ${email} ${password}\n`;
        fs.appendFileSync(filePath, result);
        const formattedDate = randomYear();
        let gender = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        await settAccount(session, nameAccount, email, gender, formattedDate);
        color.green(`Success Register and save account to result.txt\n`);
        i++;
      } catch (error) {
        console.log(error);
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
