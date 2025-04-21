import axios from 'axios';
import 'dotenv/config';
const { SMSHUB_APIKEY } = process.env;

export async function getBalance() {
  try {
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${SMSHUB_APIKEY}&action=getBalance`;
    const { data } = await axios.get(url);
    if (data.includes('ACCESS_BALANCE')) {
      const balance = parseFloat(data.split(':')[1]);
      console.log(`Success get smshub balance = ${balance}`);
      if (balance > 0) {
        return balance;
      } else {
        throw Error('  No balance smshub');
      }
    }
    throw Error(`  Failed when get balance , ${data}`);
  } catch (error) {
    throw error;
  }
}
export const orderNum = async () => {
  try {
    const serviceType = 'ot';
    const country = '6';
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${SMSHUB_APIKEY}&action=getNumber&service=${serviceType}&operator=xl&country=${country}&maxPrice=0.0360`;
    const { data } = await axios.get(url);
    if (data.includes('NO_NUMBERS')) {
      throw Error(`  Failed when order number, ${data}`);
    }
    if (data.includes('ACCESS_NUMBER')) {
      const orderid = data.split(':')[1];
      const number = data.split(':')[2];
      console.log(
        `Success get number with\n> orderid = ${orderid}\n> number = ${number}`
      );
      return { orderid, number };
    }
  } catch (error) {
    throw error;
  }
};
export const setMaxPrice = async (maxPrice) => {
  try {
    const serviceType = 'ot';
    const country = '6';
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${SMSHUB_APIKEY}&action=setMaxPrice&service=${serviceType}&country=${country}&random=&maxPrice=${maxPrice}`;
    const { data } = await axios.get(url);
    console.log(`Success set max price to ${maxPrice} ${data}`);
  } catch (error) {
    throw error;
  }
};
export const checkCode = async (orderid) => {
  try {
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${SMSHUB_APIKEY}&action=getStatus&id=${orderid}`;
    const codeResponse = await axios.get(url);
    const code = codeResponse.data.split(':')[1]?.trim();
    if (code !== undefined) {
      return code;
    }
    return undefined;
  } catch (error) {
    throw error;
  }
};
export const changeStatus = async (orderid, status) => {
  try {
    // 8 = cancel, 6 = done
    const url = `https://smshub.org/stubs/handler_api.php?api_key=${SMSHUB_APIKEY}&action=setStatus&status=${status}&id=${orderid}`;
    const { data } = await axios.post(url);
    return data;
  } catch (error) {
    throw error;
  }
};
