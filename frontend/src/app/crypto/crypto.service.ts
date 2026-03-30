import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { BaseApiService } from '../shared/services/base-api.service';
import { API_CONFIG } from '../shared/constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class CryptoService extends BaseApiService {
    private isBrowser: boolean;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        super(`${API_CONFIG.GATEWAY_URL}/common/api/v1/public/crypto`);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    async encryptGCM(plaintext: string, secretKey: string): Promise<string> {
        if (!this.isBrowser) return '';
        if (!plaintext || !secretKey) throw new Error("Plain text and Secret Key are required.");

        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(secretKey),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            enc.encode(plaintext)
        );

        const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
        combined.set(salt);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

        return this.bufferToBase64(combined);
    }

    async decryptGCM(encryptedData: string, secretKey: string): Promise<string> {
        if (!this.isBrowser) return '';
        try {
            const combined = this.base64ToBuffer(encryptedData);
            if (combined.length < 28) throw new Error("Invalid encrypted data format");

            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);

            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw",
                enc.encode(secretKey),
                { name: "PBKDF2" },
                false,
                ["deriveKey"]
            );

            const key = await window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt,
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                false,
                ["encrypt", "decrypt"]
            );

            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                key,
                data
            );

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error(e);
            throw new Error("Decryption failed. Incorrect key or corrupted data.");
        }
    }

    async getPublicKey(alias: string): Promise<string> {
        const response: any = await lastValueFrom(
            this.get(`/keys/${alias}/public`)
        );
        return response.publicKey;
    }

    async encryptRSA(plaintext: string, publicKeyBase64: string): Promise<string> {
        if (!this.isBrowser) return '';
        try {
            // 1. Decode Base64 Public Key (it's in SPKI format from backend)
            const binaryDerString = window.atob(publicKeyBase64);
            const binaryDer = new Uint8Array(binaryDerString.length);
            for (let i = 0; i < binaryDerString.length; i++) {
                binaryDer[i] = binaryDerString.charCodeAt(i);
            }

            // 2. Import Key into Web Crypto API
            const publicKey = await window.crypto.subtle.importKey(
                "spki",
                binaryDer.buffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            );

            // 3. Encrypt data
            const encoded = new TextEncoder().encode(plaintext);
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                encoded
            );

            // 4. Return as Base64
            return this.bufferToBase64(new Uint8Array(encrypted));
        } catch (e) {
            console.error(e);
            throw new Error("RSA Encryption failed. Invalid Public Key or format.");
        }
    }

    async encryptRemote(data: string, key: string): Promise<string> {
        // key có thể là chuỗi thô hoặc "alias:tên_key"
        const response: any = await lastValueFrom(
            this.post(`/encrypt`, { data, key })
        );
        return response.result;
    }

    async decryptRemote(data: string, key: string): Promise<string> {
        // key có thể là chuỗi thô hoặc "alias:tên_key"
        const response: any = await lastValueFrom(
            this.post(`/decrypt`, { data, key })
        );
        return response.result;
    }

    hashMD5(text: string): string {
        return CryptoJS.MD5(text).toString();
    }

    hashSHA256(text: string): string {
        return CryptoJS.SHA256(text).toString();
    }

    encodeBase64(text: string): string {
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
    }

    decodeBase64(text: string): string {
        return CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8);
    }

    async decryptRSARemote(data: string, alias: string): Promise<string> {
        const response: any = await lastValueFrom(
            this.post(`/decrypt-rsa`, { data, key: alias })
        );
        return response.result;
    }

    private bufferToBase64(buf: Uint8Array): string {
        let binary = '';
        const len = buf.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buf[i]);
        }
        return window.btoa(binary);
    }

    private base64ToBuffer(base64: string): Uint8Array {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
}
