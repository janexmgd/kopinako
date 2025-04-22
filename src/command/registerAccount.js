import 'dotenv/config';
import inquirer from 'inquirer';
import { faker } from '@faker-js/faker/locale/id_ID';
import path from 'path';
import fs from 'fs';
import boxen from 'boxen';
import { readFile } from 'fs/promises';
import random from 'random';
import {
  changeStatus,
  checkCode,
  getBalance,
  orderNum,
  // setMaxPrice,
} from '../func/smshub.js';
import { register, settAccount, validateRegister } from '../func/nako.js';
import color from '../utils/color.js';

const config = JSON.parse(
  await readFile(path.join(process.cwd(), 'config.json'))
);

const randomYear = () => {
  const currentDate = new Date();
  const randomYear = Math.floor(Math.random() * (2004 - 2000 + 1)) + 2000;
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${randomYear}-${month}-${day}`;
};

const readResult = async () => {
  try {
    const listAccount = await readFile('result.txt', 'utf-8');
    let accountJson = [];
    listAccount
      .split('\n')
      .slice(0, -1)
      .map((line) => {
        const [phoneNum, email, password, session] = line.split(' ');
        accountJson.push({ phoneNum, email, password, session });
      });
    return accountJson;
  } catch (error) {
    throw error;
  }
};
const nakoRegister = async () => {
  const jsonAccount = await readResult();
  let nameAccount;
  if (config.auto.name == true) {
    let name = `${faker.person.fullName({ sex: config.gender })}`;
    let nameArr = name.split(' ');
    if (nameArr.length == 3) {
      if (nameArr[0] === nameArr[1]) {
        name = `${nameArr[1]} ${nameArr[2]}`;
        nameAccount = name;
      } else {
        nameAccount = name;
      }
    } else {
      nameAccount = name;
    }
  } else {
    const { nameQuestion } = await inquirer.prompt({
      type: 'message',
      message: 'insert name of account',
      name: 'nameQuestion',
    });
    nameAccount = nameQuestion;
  }

  let email;
  if (config.auto.email == true) {
    if (!config.email_address) {
      throw new Error('email_address is not set in config.json');
    } else {
      while (true) {
        const { email_address } = config;
        const [username, domain] = email_address.split('@');
        email = `${username}+${random.int(0, 9999)}@${domain}`;
        const isEmailUsed = jsonAccount.every(
          (account) => account.email !== email
        );
        if (isEmailUsed) {
          break;
        } else {
          console.log(`email ${email} already used`);
        }
      }
    }
  } else {
    const { emailQuestion } = await inquirer.prompt({
      type: 'message',
      message: 'insert email of account',
      name: 'emailQuestion',
    });
    email = emailQuestion;
  }
  let password;
  if (config.password) {
    password = config.password;
  } else {
    const { passwordQuestion } = await inquirer.prompt({
      type: 'message',
      message: 'insert password of your account',
      name: 'passwordQuestion',
    });
    password = passwordQuestion;
  }
  let referral_code;
  if (config.referral_code) {
    referral_code = config.referral_code;
  } else {
    const { referral_codeQuestion } = await inquirer.prompt({
      type: 'message',
      message: 'insert refferal code of your account',
      name: 'referral_codeQuestion',
    });
    referral_code = referral_codeQuestion;
  }
  color.italic(`using data`);
  console.log(JSON.stringify({ nameAccount, email, password, referral_code }));
  return {
    nameAccount,
    email,
    password,
    referral_code,
  };
};
const registerAccount = async () => {
  try {
    process.stdout.write('\x1Bc');
    console.log(
      boxen(`nako register and set birthday`, {
        align: 'center',
        padding: 2,
      })
    );

    // return;
    const { SMSHUB_APIKEY } = process.env;
    if (!SMSHUB_APIKEY) {
      return color.red('Please set the SMSHUB_APIKEY environment variable.');
    }
    const { manyAccounts } = await inquirer.prompt({
      type: 'number',
      message: 'how many account you want ?',
      name: 'manyAccounts',
    });
    // let manyAccounts = 1;
    let i = 1;
    while (i <= manyAccounts) {
      try {
        process.stdout.write('\x1Bc');
        console.log(`PROCESS ACCOUNT ${i} of ${manyAccounts}`);
        await getBalance();
        const MAX_WAIT_TIME = config.otp.MAX_WAIT_TIME || 30000;
        const CHECK_INTERVAL = config.otp.CHECK_INTERVAL || 5000;
        const { nameAccount, email, password, referral_code } =
          await nakoRegister();

        const { orderid, number } = await orderNum();
        let phoneNum = number.replace(/^62/, '+62');
        let id = orderid;
        let totalTimeWaited = 0;
        let code;
        // let tryingOTP = 1;
        await validateRegister(
          nameAccount,
          phoneNum,
          password,
          email,
          referral_code
        );
        while (totalTimeWaited <= MAX_WAIT_TIME) {
          if (totalTimeWaited === 0) {
            color.italic(`checking otp order id ${id}`);
          }

          // Clear the line and write the waiting message
          process.stdout.write(`\rWAITING OTP ${totalTimeWaited}ms`);

          await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
          code = await checkCode(id);
          if (code !== undefined) {
            color.italic(`\nchanging status order ${id}`);
            const status = await changeStatus(id, '6');
            color.italic(`status order id ${id} ${status}`);
            break;
          }

          totalTimeWaited += CHECK_INTERVAL;

          if (totalTimeWaited >= MAX_WAIT_TIME) {
            color.italic(`\nchanging status order ${id}`);
            const status = await changeStatus(id, '8');
            color.italic(`status order id ${id} ${status}`);
            let isOrderagain = true;
            if (isOrderagain) {
              const { orderid, number } = await orderNum();
              phoneNum = number.replace(/^62/, '+62');
              await validateRegister(
                nameAccount,
                phoneNum,
                password,
                email,
                referral_code
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
        color.italic(`otp ${otp}`);

        const doingRegister = await register(
          nameAccount,
          phoneNum,
          password,
          email,
          referral_code,
          otp
        );
        color.italic(`success register`);
        const session = doingRegister.headers.session_key;
        console.log(doingRegister.data.user);
        const filePath = path.join(process.cwd(), 'result.txt');
        const jsonResultPath = path.join(process.cwd(), 'result.json');
        if (!fs.existsSync(jsonResultPath)) {
          color.italic(`Creating file ${jsonResultPath}`);
          fs.open(jsonResultPath, 'w', (err) => {
            if (err) {
              throw err;
            }
            fs.writeFileSync(jsonResultPath, JSON.stringify([]));
            console.log('success creating file');
          });
        }
        if (!fs.existsSync(filePath)) {
          color.italic(`Creating file ${filePath}`);
          fs.open(filePath, 'w', (err) => {
            if (err) {
              throw err;
            }

            console.log('success creating file');
          });
        }
        let accountAuthJsonData = {
          auth: { phoneNum, email, password, session },
        };
        fs.readFile(jsonResultPath, 'utf-8', (err, data) => {
          if (err) {
            throw err;
          }
          let jsonData = JSON.parse(data);
          jsonData.push(accountAuthJsonData);
          fs.writeFile(jsonResultPath, JSON.stringify(jsonData), (err) => {
            if (err) {
              throw err;
            }
            console.log('success writing file json');
          });
        });
        const result = `${phoneNum} ${email} ${password} ${session}\n`;
        fs.appendFileSync(filePath, result);
        const formattedDate = randomYear();
        // let gender = 1; // 1 man 2 woman
        const gender = config.gender == 'female' ? 2 : 1;
        const settBirthday = await settAccount(
          session,
          nameAccount,
          email,
          gender,
          formattedDate
        );
        fs.readFile(jsonResultPath, 'utf-8', (err, fileData) => {
          if (err) throw err;

          let data = JSON.parse(fileData);
          const account = data.find(
            (account) => account.auth.session === session
          );

          if (account) {
            account.user = settBirthday.user;
          } else {
            console.error(`No account found with session: ${session}`);
            return;
          }
          fs.writeFile(jsonResultPath, JSON.stringify(data, null, 2), (err) => {
            if (err) throw err;
            console.log('File updated successfully!');
          });
        });
        i++;
      } catch (error) {
        console.log(error);
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }
};
export default registerAccount;
