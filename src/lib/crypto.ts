import CryptoJS from 'crypto-js';

export const encrypt = (text: string, key: string) => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashPassword = (password: string) => {
  return CryptoJS.SHA256(password).toString();
};
