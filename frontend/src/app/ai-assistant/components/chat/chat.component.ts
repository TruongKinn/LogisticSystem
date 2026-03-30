import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ChatMessage, RagStatusResponse } from '../../models/ai.model';
import { AiService } from '../../services/ai.service';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

@Component({
    selector: 'app-ai-chat',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzInputModule,
        NzButtonModule,
        NzIconModule,
        NzTagModule,
        NzSwitchModule,
        NzToolTipModule,
        NzBadgeModule,
        NzBreadCrumbModule
    ],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked, OnInit {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    messages: ChatMessage[] = [
        {
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý ảo Antigravity.\n\n🤖 Chế độ thường: Trả lời câu hỏi chung.\n🔍 Chế độ RAG: Tìm kiếm và tư vấn sản phẩm dựa trên catalog thực tế.',
            timestamp: new Date(),
            source: 'gemini'
        }
    ];
    userInput: string = '';
    isLoading: boolean = false;

    /** Toggle giữa plain Gemini và RAG mode */
    useRag: boolean = false;

    /** Trạng thái RAG index */
    ragStatus: RagStatusResponse | null = null;
    ragStatusLoading: boolean = false;

    /** Trạng thái sync từ product-service */
    isSyncing: boolean = false;

    constructor(
        private aiService: AiService,
        private cdr: ChangeDetectorRef,
        private message: NzMessageService
    ) { }

    ngOnInit() {
        this.loadRagStatus();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    loadRagStatus() {
        this.ragStatusLoading = true;
        this.aiService.getRagStatus().subscribe({
            next: (status) => {
                this.ragStatus = status;
                this.ragStatusLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.ragStatus = null;
                this.ragStatusLoading = false;
            }
        });
    }

    sendMessage() {
        if (!this.userInput.trim() || this.isLoading) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content: this.userInput.trim(),
            timestamp: new Date()
        };

        this.messages.push(userMsg);
        const currentInput = this.userInput;
        this.userInput = '';
        this.isLoading = true;
        this.cdr.detectChanges();

        if (this.useRag) {
            this.aiService.ragChat(currentInput).subscribe({
                next: (res) => {
                    this.messages.push({
                        role: 'assistant',
                        content: res.answer,
                        timestamp: new Date(),
                        source: 'rag',
                        isRag: true
                    });
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                },
                error: (err) => {
                    this.messages.push({
                        role: 'assistant',
                        content: 'Xin lỗi, đã có lỗi xảy ra khi kết nối tới AI (RAG mode).',
                        timestamp: new Date(),
                        source: 'rag'
                    });
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    console.error(err);
                }
            });
        } else {
            this.aiService.chat(currentInput).subscribe({
                next: (res) => {
                    if (res && res.answer) {
                        this.messages.push({
                            role: 'assistant',
                            content: res.answer,
                            timestamp: new Date(),
                            source: 'gemini'
                        });
                    }
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    this.scrollToBottom();
                },
                error: (err) => {
                    this.messages.push({
                        role: 'assistant',
                        content: 'Xin lỗi, đã có lỗi xảy ra khi kết nối tới máy chủ AI.',
                        timestamp: new Date(),
                        source: 'gemini'
                    });
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    console.error(err);
                }
            });
        }
    }

    onEnter(event: any) {
        if (!event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    clearChat() {
        this.messages = [{
            role: 'assistant',
            content: 'Cuộc trò chuyện đã được xóa. Tôi có thể giúp gì cho bạn?',
            timestamp: new Date(),
            source: this.useRag ? 'rag' : 'gemini'
        }];
        this.cdr.detectChanges();
    }

    syncIndex() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        this.message.loading('Đang sync sản phẩm vào RAG index...', { nzDuration: 3000 });
        this.cdr.detectChanges();

        this.aiService.syncRagIndex().subscribe({
            next: (res) => {
                this.message.success(res.message || 'Sync đã bắt đầu!');
                // Poll status mỗi 3 giây để cập nhật badge
                const interval = setInterval(() => {
                    this.aiService.getRagStatus().subscribe(status => {
                        this.ragStatus = status;
                        this.cdr.detectChanges();
                        if (!status.syncing) {
                            clearInterval(interval);
                            this.isSyncing = false;
                            this.message.success(`✅ Sync hoàn tất! ${status.indexedProducts} sản phẩm đã index.`);
                            this.cdr.detectChanges();
                        }
                    });
                }, 3000);
            },
            error: (err) => {
                this.isSyncing = false;
                this.message.error('Sync thất bại: ' + (err.message || 'Lỗi kết nối'));
                this.cdr.detectChanges();
            }
        });
    }

    get ragIndexCount(): number {
        return this.ragStatus?.indexedProducts ?? 0;
    }

    get ragReady(): boolean {
        return this.ragStatus?.status === 'READY';
    }

    private scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }
}
