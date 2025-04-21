import 'dotenv/config';
import inquirer from 'inquirer';
import { register, settAccount, validateRegister } from './func/nako.js';
import path from 'path';
import fs from 'fs';
import boxen from 'boxen';
import color from './utils/color.js';
import {
  changeStatus,
  checkCode,
  getBalance,
  orderNum,
  // setMaxPrice,
} from './func/smshub.js';
const randomYear = () => {
  const currentDate = new Date();
  const randomYear = Math.floor(Math.random() * (2004 - 2000 + 1)) + 2000;
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${randomYear}-${month}-${day}`;
};
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
    // const { manyAccounts } = await inquirer.prompt({
    //   type: 'number',
    //   message: 'how many account you want ?',
    //   name: 'manyAccounts',
    // });
    let manyAccounts = 1;
    let i = 1;
    while (i <= manyAccounts) {
      try {
        await getBalance();
        // const maxPrice = 0.012;
        // await setMaxPrice(maxPrice);
        const MAX_WAIT_TIME = 30000;
        const CHECK_INTERVAL = 3000;
        const { orderid, number } = await orderNum();
        let phoneNum = number.replace(/^62/, '+62');
        let id = orderid;
        let totalTimeWaited = 0;
        let code;
        const { nameAccount } = await inquirer.prompt({
          type: 'message',
          message: 'insert name of account',
          name: 'nameAccount',
        });
        const { email } = await inquirer.prompt({
          type: 'message',
          message: 'insert your email',
          name: 'email',
        });
        const { password } = await inquirer.prompt({
          type: 'message',
          message: 'insert password of your account',
          name: 'password',
        });

        const { refferal_code } = await inquirer.prompt({
          type: 'message',
          message: 'insert refferall code',
          name: 'refferal_code',
        });
        await validateRegister(
          nameAccount,
          phoneNum,
          password,
          email,
          refferal_code
        );
        let tryingOTP = 1;
        while (totalTimeWaited <= MAX_WAIT_TIME) {
          if (totalTimeWaited == 0) {
            color.italic(`checking otp order id ${id}`);
          }
          color.italic(`WAITING OTP ${totalTimeWaited}ms`);
          await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
          code = await checkCode(id);
          if (code != undefined) {
            color.italic(`changing status order ${id}`);
            const status = await changeStatus(id, '6');
            color.italic(`status order id ${id} ${status}`);
            break;
          }
          totalTimeWaited += CHECK_INTERVAL;
          if (totalTimeWaited >= MAX_WAIT_TIME) {
            color.italic(`changing status order ${id}`);
            const status = await changeStatus(id, '8');
            color.italic(`status order id ${id} ${status}`);
            // if (tryingOTP <= 3) {
            //   await validateRegister(
            //     nameAccount,
            //     phoneNum,
            //     password,
            //     email,
            //     refferal_code
            //   );
            //   tryingOTP++;
            //   totalTimeWaited = 0;
            // } else {
            //   color.red(`failed obtain otp at 3 chance`);
            //   break;
            // }
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
        console.log(code.split(' '));

        const otp = code.split('.')[0].split(' ')[8];
        color.italic('otp ', otp);

        const doingRegister = await register(
          nameAccount,
          phoneNum,
          password,
          email,
          refferal_code,
          otp
        );
        color.italic(`success register`);
        const session = doingRegister.headers.session_key;
        console.log(JSON.stringify(doingRegister.data.user));
        const filePath = path.join(process.cwd(), 'result.txt');
        if (!fs.existsSync(filePath)) {
          color.italic(`Creating file ${filePath}`);
          fs.open(filePath, 'w', (err) => {
            if (err) {
              throw err;
            }
            console.log('success creating file');
          });
        }
        const result = `${phoneNum} ${email} ${password}\n`;
        fs.appendFileSync(filePath, result);
        const formattedDate = randomYear();
        let gender = 1; // 1 man 2 woman
        const settBirthday = await settAccount(
          session,
          nameAccount,
          email,
          gender,
          formattedDate
        );
        console.log(settBirthday);

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
