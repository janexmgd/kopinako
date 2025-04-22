import axios from 'axios';
import 'dotenv/config';
const { VIRTUSIM_APIKEY } = process.env;

let BASE_URL = 'https://virtusim.com/api/v2/json.php';
export async function getBalance() {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        api_key: VIRTUSIM_APIKEY,
        action: 'balance',
      },
    });
    if (data.status == true) {
      const balance = parseFloat(data.usd_balance);
      console.log(`Virtusim balance = ${balance}`);
      if (balance > 0) {
        return balance;
      } else {
        throw Error('  No balance smshub');
      }
    } else {
      throw Error(`Failed when get balance , ${data.data.msg}`);
    }
  } catch (error) {
    throw error;
  }
}
export const listCountry = async () => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        api_key: VIRTUSIM_APIKEY,
        action: 'list_country',
      },
    });
    // indo 6
    return data.data;
  } catch (error) {
    throw error;
  }
};
export const listService = async () => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        api_key: VIRTUSIM_APIKEY,
        action: 'services',
        country: 'Indonesia',
        service: '',
      },
    });
    // indo 6
    const listAnyOther = data.data.filter(
      (item) => item.name == 'Aplikasi Lainnya'
    );
    const lowestPrice = listAnyOther.reduce((min, item) => {
      return Math.min(min, Number(item.price));
    }, Infinity);
    const lowestPriceItems = listAnyOther.filter(
      (item) => Number(item.price) === lowestPrice
    );

    return lowestPriceItems[0];
  } catch (error) {
    throw error;
  }
};
export const orderNum = async () => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        api_key: VIRTUSIM_APIKEY,
        action: 'order',
        service: '6165',
        operator: 'any',
      },
    });
    // response
    // data: {
    //   id: 23860655,
    //   number: '6282225182989',
    //   operator: 'any',
    //   service_id: '6165',
    //   service_name: 'Any other'
    // }
    const orderid = data.data.id;
    const number = data.data.number;
    return { orderid, number };
  } catch (error) {
    throw error;
  }
};
export const checkCode = async (orderId) => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        api_key: VIRTUSIM_APIKEY,
        action: 'status',
        id: orderId,
      },
    });
    // {
    //   id: '23862633',
    //   status: 'Pending',
    //   number: '6287712971028',
    //   sms: '-',
    //   more_codes: null,
    //   service_name: 'Any other',
    //   price: '655',
    //   created_at: '2025-04-22 18:23:31',
    //   is_api: '1'
    // }
    // return data.data;
    if (data.data.sms !== '-') {
      return data.data.sms;
    } else {
      return undefined;
    }
  } catch (error) {
    throw error;
  }
};
export const changeStatus = async (orderId, status) => {
  try {
    // status
    // 1 = Ready

    // 2 = Cancel

    // 3 = Resend

    // 4 = Completed
    const { data } = await axios.get(BASE_URL, {
      params: {
        api_key: VIRTUSIM_APIKEY,
        action: 'set_status',
        id: orderId,
        status: status,
      },
    });
    console.log(data.data);
  } catch (error) {
    throw error;
  }
};
