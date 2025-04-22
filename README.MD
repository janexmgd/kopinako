<h1 align="center"><font size="9">Kopinako</font></h1>

<p>javascript code to register at kopinako app,sett birthday(current date),and check voucher</p>

**_made with ♡
<a href="https://www.facebook.com/janexmgd" >janexmgd</a>_**

### set-config.json

**_please set config json first_**

```
{
 {
  "auto": {
    "name": true, // use faker for auto
    "email": true // u must insert email_address
  },
  "email_address": "akunhok018@gmail.com", // insert your email
  "password": "DennyPacarMinju#1299", // your kopinako password
  "referral_code": "DENNYS7U", // your refferal code
  "gender": "male", // male or female gender kopinako
  "otp": {
    "CHECK_INTERVAL": 3000, // interval check otp
    "MAX_WAIT_TIME": 30000 // max wait otp
  }
}
}
```

### set-env

- insert your smshub apikey to .env file

```
SMSHUB_APIKEY=
```

### how-to-run

- install package

```
npm install
```

- run code

```
npm run start
```
