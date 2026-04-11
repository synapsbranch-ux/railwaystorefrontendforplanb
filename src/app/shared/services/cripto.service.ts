import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CriptoService {

  private secretKey: string = 'a07f8b7e-e0ac-4f5a-a1b9-fcab0539bcaf';  // Use a secret key, preferably from environment variables

  constructor() { }

  // Encryption method
  encryptParam(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey).toString(); // Encrypt the value
  }

  // Decryption method
  decryptParam(value: string): string {
    const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Decrypt the value back to plain text
  }
}
