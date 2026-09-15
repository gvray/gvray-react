import CryptoJS from 'crypto-js';
const aseKey = __APP_AES_KEY__;
const iv = __APP_AES_IV__;
let key = CryptoJS.enc.Utf8.parse(aseKey);
let ivs = CryptoJS.enc.Utf8.parse(iv);

//加密
export function encrypt(data: any) {
  let encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: ivs,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

//解密
export function decrypt(data: any) {
  let decrypt = CryptoJS.AES.decrypt(data, key, {
    iv: ivs,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

export default {
  encrypt,
  decrypt,
};
