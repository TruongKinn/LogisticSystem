import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export abstract class BaseApiService {
    protected http = inject(HttpClient);

    protected constructor(protected baseUrl: string) { }

    protected get<T>(path: string, params?: any): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}${path}`, { params });
    }

    protected post<T>(path: string, body: any, options?: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}${path}`, body, options) as Observable<T>;
    }

    protected put<T>(path: string, body: any, params?: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}${path}`, body, { params }) as Observable<T>;
    }

    protected delete<T>(path: string, options?: any): Observable<T> {
        // Check if options has params property, if not and options exists, assume it is params if it doesn't look like an HttpOptions object?
        // To be safe, let's just pass options through. Callers should pass { params: ... }
        return this.http.delete<T>(`${this.baseUrl}${path}`, options) as Observable<T>;
    }
    protected getText(path: string, params?: any): Observable<string> {
        return this.http.get(`${this.baseUrl}${path}`, { params, responseType: 'text' }) as any as Observable<string>;
    }

    protected postText(path: string, body: any, options?: any): Observable<string> {
        return this.http.post(`${this.baseUrl}${path}`, body, { ...options, responseType: 'text' }) as any as Observable<string>;
    }

    protected postTextWithTimeout(path: string, body: any, timeoutMs: number = 300000): Observable<string> {
        return this.http.post(`${this.baseUrl}${path}`, body, {
            responseType: 'text',
        }) as any as Observable<string>;
    }

    protected downloadBlob(path: string, params?: any): Observable<Blob> {
        return this.http.get(`${this.baseUrl}${path}`, {
            params,
            responseType: 'blob'
        });
    }
}
