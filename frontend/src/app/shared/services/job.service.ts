import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constant';

export interface JobDefinition {
    id: number;
    name: string;
    cronExpression: string;
    jobType: string;
    enabled: boolean;
    lastReportPath?: string;
    lastRunAt?: string;
    status?: string; // IDLE, RUNNING
}

@Injectable({
    providedIn: 'root'
})
export class JobService extends BaseApiService {

    constructor() {
        super(`${API_CONFIG.GATEWAY_URL}/job-supervisor/api/v1/jobs`);
    }

    getJobs(): Observable<JobDefinition[]> {
        return this.get<JobDefinition[]>('');
    }

    triggerJob(jobName: string, parameters: any): Observable<string> {
        return this.postText(`/${jobName}/trigger`, parameters);
    }

    createJob(job: JobDefinition): Observable<JobDefinition> {
        return this.post<JobDefinition>('', job);
    }

    updateJob(id: number, job: JobDefinition): Observable<JobDefinition> {
        return this.put<JobDefinition>(`/${id}`, job);
    }

    deleteJob(id: number): Observable<any> {
        return this.delete(`/${id}`);
    }
}
