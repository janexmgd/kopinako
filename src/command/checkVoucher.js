import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { readFile } from 'fs/promises';
import chalk from 'chalk';
import { login, userVoucher } from '../func/nako.js';
import { table, getBorderCharacters } from 'table';

const checkAccountVoucher = async () => {
  try {
    let tableData = [['id', 'code', 'start_date', 'end_date', 'description']];
    const listAccount = await readFile(
      path.join(process.cwd(), 'result.txt'),
      'utf-8'
    );
    let accountTxtJson = [];
    listAccount
      .split('\n')
      .slice(0, -1)
      .map((line, index) => {
        const [phoneNum, email, password, session] = line.split(' ');
        accountTxtJson.push({
          index: index + 1,
          phoneNum,
          email,
          password,
          session: session || '',
        });
      });
    const choices = accountTxtJson.map((account) => {
      return {
        name:
          account.session !== ''
            ? `[${account.index}] ${account.phoneNum} ${chalk.green(
                '[session true]'
              )}`
            : `[${account.index}] ${account.phoneNum} ${chalk.red(
                '[session false]'
              )}`,
        value: account,
      };
    });
    const { input } = await inquirer.prompt({
      type: 'list',
      message: 'select account red no session green with session',
      name: 'input',
      choices: choices,
    });
    let sessionLogin;
    const resultJsonfilePath = path.join(process.cwd(), 'result.json');
    let listVoucher;
    if (input.session == '') {
      const doLogin = await login(input.phoneNum, input.password);
      sessionLogin = doLogin.headers.session_key;
      listVoucher = await userVoucher(sessionLogin);
      fs.readFile(resultJsonfilePath, 'utf-8', (err, fileData) => {
        if (err) throw err;
        let data = JSON.parse(fileData);
        const account = data.find(
          (account) => account.auth.phoneNum == input.phoneNum
        );
        if (account) {
          account.user = doLogin.data.user;
          account.auth = {
            phoneNum: input.phoneNum,
            email: input.email,
            password: input.password,
            session: sessionLogin,
          };
          account.voucher = listVoucher;
        } else {
          data.push({
            user: doLogin.data.user,
            auth: {
              phoneNum: input.phoneNum,
              email: input.email,
              password: input.password,
              session: sessionLogin,
            },
            voucher: listVoucher,
          });
        }
        fs.writeFile(
          resultJsonfilePath,
          JSON.stringify(data, null, 2),
          (err) => {
            if (err) {
              throw err;
            }
            console.log('success writing file json');
          }
        );
      });
    } else {
      const doLogin = await login(input.phoneNum, input.password);
      sessionLogin = doLogin.headers.session_key;
      listVoucher = await userVoucher(sessionLogin);
      fs.readFile(resultJsonfilePath, 'utf-8', (err, fileData) => {
        if (err) throw err;
        let data = JSON.parse(fileData);
        const account = data.find(
          (account) => account.auth.phoneNum == input.phoneNum
        );
        if (account) {
          account.user = doLogin.data.user;
          account.auth = {
            phoneNum: input.phoneNum,
            email: input.email,
            password: input.password,
            session: sessionLogin,
          };
          account.voucher = listVoucher;
        } else {
          data.push({
            user: doLogin.data.user,
            auth: {
              phoneNum: input.phoneNum,
              email: input.email,
              password: input.password,
              session: sessionLogin,
            },
            voucher: listVoucher,
          });
        }
        fs.writeFile(
          resultJsonfilePath,
          JSON.stringify(data, null, 2),
          (err) => {
            if (err) {
              throw err;
            }
            console.log('success writing file json');
          }
        );
      });
    }
    for (const voucher of listVoucher.assigned) {
      // let tableData = [['id', 'code', 'start_date', 'end_date', 'description']];
      tableData.push([
        voucher.id,
        voucher.code,
        voucher.start_date,
        voucher.end_date,
        voucher.template.short_description,
      ]);
    }
    console.log(
      table(tableData, {
        header: {
          alignment: 'center',
          content: 'List Voucher',
        },
        border: getBorderCharacters('ramac'),
      })
    );
  } catch (error) {
    throw error;
  }
};
export default checkAccountVoucher;
