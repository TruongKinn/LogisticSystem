import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { PwdChangeRequestDTO, UserCreationRequestDTO, UserResponseDTO, UserUpdateDTO } from '../models/user.model';
import { API_CONFIG } from '../constants/api.constant';

import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/account`);
    }

    getUsers(page: number, size: number, sort?: string, search?: string[]): Observable<PageResponse<UserResponseDTO>> {
        const params: any = { page, size };
        if (sort) {
            params.sort = sort;
        }
        if (search && search.length > 0) {
            params.search = search;
        }
        return this.get<PageResponse<UserResponseDTO>>('/user/list', params);
    }

    getUserDetails(userId: number): Observable<UserResponseDTO> {
        return this.get<UserResponseDTO>(`/user/${userId}`);
    }

    addUser(user: UserCreationRequestDTO): Observable<number> {
        return this.post<number>('/user/add', user);
    }

    updateUser(user: UserUpdateDTO): Observable<void> {
        return this.put<void>('/user/upd', user);
    }

    changePassword(data: PwdChangeRequestDTO): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/user/change-pwd`, data);
    }

    deleteUser(userId: number): Observable<void> {
        return this.delete<void>(`/user/del/${userId}`);
    }

    saveSetting(key: string, value: string): Observable<void> {
        return this.post<void>('/user/setting', { key, value });
    }

    getSetting(key: string): Observable<{ value: string }> {
        return this.get<{ value: string }>(`/user/setting/${key}`);
    }

    uploadAvatar(userId: number, file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        return this.post<string>(`/users/${userId}/avatar`, formData, {
            responseType: 'text' as 'json'
        });
    }
}
