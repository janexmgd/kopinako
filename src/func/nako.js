import axios from 'axios';
import httpErrorHandle from '../utils/httpErrorHandle.js';
export async function validateRegister(
  name,
  mobile_number,
  password,
  email,
  referral_code
) {
  try {
    const response = await axios.post(
      'https://landing-nako.stamps.co.id/api/auth/validate-register-identifier',
      {
        name: name,
        mobile_number: mobile_number, // e.g +62838xxxxxxxx
        password: password, // e.g Password#123
        email: email,
        referral_code: referral_code,
      },
      {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          authorization: 'token dLzZDjYo71l2a3b04DI1VddaUiegcIX3EsBiO3VG',
          'content-type': 'application/json; charset=utf-8',
        },
      }
    );
    return response.data;
  } catch (error) {
    httpErrorHandle('validate register failed', error);
  }
}
export async function register(
  name,
  mobile_number,
  password,
  email,
  referral_code,
  otp
) {
  try {
    const response = await axios.post(
      'https://landing-nako.stamps.co.id/api/auth/register',
      {
        name: name,
        mobile_number: mobile_number, // e.g +62838xxxxxxxx
        password: password, // e.g Password#123
        email: email,
        referral_code: referral_code,
        otp: otp,
      },
      {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          authorization: 'token dLzZDjYo71l2a3b04DI1VddaUiegcIX3EsBiO3VG',
          'content-type': 'application/json; charset=utf-8',
        },
      }
    );
    return response;
  } catch (error) {
    httpErrorHandle('register failed', error);
  }
}
export async function userSync(session) {
  try {
    const response = await axios.get(
      'https://landing-nako.stamps.co.id/api/auth/user-sync',
      {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          authorization: `session ${session}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    httpErrorHandle('user sync failed', error);
  }
}
export async function userVoucher(session) {
  try {
    const response = await axios.get(
      'https://nako.stamps.co.id/mobile-api/v2/vouchers/',
      {
        params: {
          include_template_groups: 'true',
        },
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          authorization: `session ${session}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    httpErrorHandle('user voucher failed', error);
  }
}
export async function settAccount(session, name, email, gender, birthday) {
  try {
    const response = await axios.post(
      'https://landing-nako.stamps.co.id/api/auth/edit-profile',
      {
        name: name,
        email: email,
        gender: gender, // 1 man 2 woman
        birthday: birthday,
        instagram: '',
      },
      {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/json; application/json; charset=utf-8',
          authorization: `session ${session}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    httpErrorHandle('sett account failed', error);
  }
}
export async function login(mobile_number, password) {
  try {
    const response = await axios.post(
      'https://landing-nako.stamps.co.id/api/auth/login',
      {
        mobile_number: mobile_number,
        password: password,
      },
      {
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Accept-Encoding': 'gzip',
          'Content-Type': 'application/json; application/json; charset=utf-8',
          authorization: 'token dLzZDjYo71l2a3b04DI1VddaUiegcIX3EsBiO3VG',
        },
      }
    );
    return response;
  } catch (error) {
    httpErrorHandle('login failed', error);
  }
}
