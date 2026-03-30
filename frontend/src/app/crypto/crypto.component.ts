import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from './crypto.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
    selector: 'app-crypto',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzCardModule,
        NzInputModule,
        NzButtonModule,
        NzSelectModule,
        NzTabsModule,
        NzFormModule,
        NzIconModule,
        NzTypographyModule,
        NzBreadCrumbModule
    ],
    templateUrl: './crypto.component.html',
    styleUrl: './crypto.component.css'
})
export class CryptoComponent {
    input = '';
    output = '';
    secretKey = '';
    selectedAlgo = 'GCM';
    processingMode: 'local' | 'remote' = 'remote';
    passwordVisible = false;
    isLoading = false;

    constructor(
        private cryptoService: CryptoService,
        private message: NzMessageService,
        private cdr: ChangeDetectorRef
    ) { }

    get secretRequired(): boolean {
        return this.selectedAlgo === 'GCM' || this.selectedAlgo === 'RSA';
    }

    async encrypt() {
        if (!this.input) return;
        if (this.secretRequired && !this.secretKey) {
            this.message.error('Please enter a secret key');
            return;
        }

        this.isLoading = true;
        this.cdr.detectChanges();
        try {
            switch (this.selectedAlgo) {
                case 'GCM':
                    this.output = await this.cryptoService.encryptRemote(this.input, this.secretKey);
                    break;
                case 'MD5':
                    this.output = this.cryptoService.hashMD5(this.input);
                    break;
                case 'SHA256':
                    this.output = this.cryptoService.hashSHA256(this.input);
                    break;
                case 'BASE64':
                    this.output = this.cryptoService.encodeBase64(this.input);
                    break;
                case 'RSA':
                    this.output = await this.cryptoService.encryptRSA(this.input, this.secretKey);
                    break;
            }
            this.message.success('Encrypted successfully');
        } catch (error: any) {
            this.message.error(error.message || 'Encryption failed');
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    async decrypt() {
        if (!this.input) return;
        if (this.secretRequired && !this.secretKey) {
            this.message.error('Please enter a secret key');
            return;
        }

        this.isLoading = true;
        this.cdr.detectChanges();
        try {
            switch (this.selectedAlgo) {
                case 'GCM':
                    this.output = await this.cryptoService.decryptRemote(this.input, this.secretKey);
                    break;
                case 'BASE64':
                    this.output = this.cryptoService.decodeBase64(this.input);
                    break;
                case 'RSA':
                    this.output = await this.cryptoService.decryptRSARemote(this.input, this.secretKey);
                    break;
                default:
                    this.message.warning('This algorithm is one-way (hashing) and cannot be decrypted');
                    return;
            }
            this.message.success('Decrypted successfully');
        } catch (error: any) {
            this.message.error(error.message || 'Decryption failed');
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    async fetchPublicKey() {
        this.isLoading = true;
        this.cdr.detectChanges();
        try {
            const alias = 'default-key'; // Bạn có thể thay đổi để lấy từ input nếu muốn
            this.output = await this.cryptoService.getPublicKey(alias);
            this.message.success(`Fetched public key for alias: ${alias}`);
        } catch (error: any) {
            this.message.error(error.message || 'Failed to fetch public key');
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    fillDefaultAlias() {
        this.secretKey = 'default-key';
        this.message.info('Filled default key alias');
    }

    copyToClipboard() {
        if (this.output) {
            navigator.clipboard.writeText(this.output).then(() => {
                this.message.success('Copied to clipboard');
            });
        }
    }
}
