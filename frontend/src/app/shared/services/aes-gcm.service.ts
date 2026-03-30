import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

@Injectable({
    providedIn: 'root'
})
export class AesGcmService {
    private isBrowser: boolean;
    private apiUrl = `${API_CONFIG.GATEWAY_URL}/common/api/v1/crypto`;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /**
     * Encrypts plaintext using backend REST API.
     */
    encryptRemote(data: string, key: string): Observable<string> {
        return this.http.post<any>(`${this.apiUrl}/encrypt`, { data, key }).pipe(
            map(res => res.result)
        );
    }

    /**
     * Decrypts encrypted data using backend REST API.
     */
    decryptRemote(data: string, key: string): Observable<string> {
        return this.http.post<any>(`${this.apiUrl}/decrypt`, { data, key }).pipe(
            map(res => res.result)
        );
    }

    /**
     * Encrypts plaintext using local Web Crypto API.
     */
    async encrypt(plaintext: string, secretKey: string): Promise<string> {
        if (!this.isBrowser) return '';
        if (!plaintext || !secretKey) throw new Error("Plain text and Secret Key are required.");

        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(secretKey),
            { name: "AES-GCM" },
            false,
            ["encrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const ciphertextBuffer = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            keyMaterial,
            enc.encode(plaintext)
        );

        const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertextBuffer), iv.length);

        return this.bufferToBase64(combined);
    }

    /**
     * Decrypts AES-GCM encrypted data using local Web Crypto API.
     */
    async decrypt(encryptedData: string, secretKey: string): Promise<string> {
        if (!this.isBrowser) return '';
        try {
            const combined = this.base64ToBuffer(encryptedData);
            if (combined.length < 28) throw new Error("Invalid encrypted data format (too short)");

            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const enc = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw",
                enc.encode(secretKey),
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                keyMaterial,
                data
            );

            return new TextDecoder().decode(decryptedBuffer);
        } catch (e) {
            console.error("Decryption error:", e);
            throw new Error("Decryption failed. Check your key or data format.");
        }
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
        if (!this.isBrowser) return new Uint8Array();
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
}
