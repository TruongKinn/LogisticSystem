import { Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forbidden',
    standalone: true,
    imports: [NzResultModule, NzButtonModule, RouterLink],
    template: `
    <nz-result nzStatus="403" nzTitle="403" nzSubTitle="Xin lỗi, bạn không có quyền truy cập trang này.">
      <div nz-result-extra>
        <button nz-button nzType="primary" routerLink="/">Quay lại trang chủ</button>
      </div>
    </nz-result>
  `,
    styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background: #fff;
    }
  `]
})
export class ForbiddenComponent { }
