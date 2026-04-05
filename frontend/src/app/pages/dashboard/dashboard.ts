import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, forkJoin, of } from 'rxjs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DashboardStats } from '../../shared/models/dashboard-stats.model';
import { DashboardService } from '../../shared/services/dashboard.service';
import { LogisticService } from '../../shared/services/logistic.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
    NzTagModule,
    NzSpinModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzToolTipModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  loading = true;
  stats: DashboardStats = {};
  lastUpdated: Date = new Date();

  autoRefreshInterval: any;
  autoRefreshEnabled = true;
  refreshIntervalSeconds = 30;

  liveTrackingInterval: any;
  liveTrackingEnabled = true;
  liveTrackingRefreshSeconds = 20;
  liveTrackingLoading = false;
  liveTrackingUpdatedAt: Date = new Date();
  liveShipments: any[] = [];

  userChartData: ChartConfiguration['data'] = {
    labels: ['Active', 'Inactive', 'Blocked'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#52c41a', '#faad14', '#ff4d4f'],
        hoverBackgroundColor: ['#73d13d', '#ffc53d', '#ff7875']
      }
    ]
  };

  userChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Phân bố trạng thái người dùng'
      }
    }
  };
  userChartType: ChartType = 'doughnut';

  orderChartData: ChartConfiguration['data'] = {
    labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: ['#faad14', '#1890ff', '#52c41a', '#ff4d4f'],
        hoverBackgroundColor: ['#ffc53d', '#40a9ff', '#73d13d', '#ff7875']
      }
    ]
  };

  orderChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Phân bố trạng thái đơn hàng'
      }
    }
  };
  orderChartType: ChartType = 'pie';

  productPriceChartData: ChartConfiguration['data'] = {
    labels: ['Giá TB', 'Giá Min', 'Giá Max'],
    datasets: [
      {
        label: 'Giá sản phẩm (VNĐ)',
        data: [0, 0, 0],
        backgroundColor: ['#1890ff', '#52c41a', '#ff4d4f'],
        borderColor: ['#096dd9', '#389e0d', '#cf1322'],
        borderWidth: 1
      }
    ]
  };

  productPriceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Thống kê giá sản phẩm'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  productPriceChartType: ChartType = 'bar';

  constructor(
    private dashboardService: DashboardService,
    private logisticService: LogisticService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAutoRefresh();
    this.loadLiveTrackingBoard();
    this.startLiveTrackingRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    this.stopLiveTrackingRefresh();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getAllStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateCharts();
        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLiveTrackingBoard(): void {
    this.liveTrackingLoading = true;
    this.logisticService.getShipments().subscribe({
      next: (shipments) => {
        const recentShipments = [...(shipments || [])]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);

        if (!recentShipments.length) {
          this.liveShipments = [];
          this.liveTrackingLoading = false;
          this.liveTrackingUpdatedAt = new Date();
          this.cdr.detectChanges();
          return;
        }

        forkJoin(
          recentShipments.map((shipment) =>
            this.logisticService.getCurrentTracking(shipment.shipmentCode).pipe(
              catchError(() => of(null))
            )
          )
        ).subscribe({
          next: (currentTrackingList) => {
            this.liveShipments = recentShipments.map((shipment, index) => {
              const currentTracking = currentTrackingList[index];
              return {
                ...shipment,
                liveStatus: currentTracking?.status || shipment.status || 'PENDING',
                liveLocation: currentTracking?.location || shipment.receiverAddress || 'Đang cập nhật',
                liveNote: currentTracking?.note || shipment.note || '',
                liveTimestamp: currentTracking?.timestamp || shipment.createdAt,
                liveReference: currentTracking?.shipmentCode || shipment.shipmentCode
              };
            });
            this.liveTrackingUpdatedAt = new Date();
            this.liveTrackingLoading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading live tracking board:', error);
            this.liveTrackingLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Error loading shipments for live tracking:', error);
        this.liveTrackingLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateCharts(): void {
    if (this.stats.userStats) {
      this.userChartData = {
        ...this.userChartData,
        datasets: [{
          data: [
            this.stats.userStats.activeUsers || 0,
            this.stats.userStats.inactiveUsers || 0,
            this.stats.userStats.blockedUsers || 0
          ],
          backgroundColor: ['#52c41a', '#faad14', '#ff4d4f'],
          hoverBackgroundColor: ['#73d13d', '#ffc53d', '#ff7875']
        }]
      };
    }

    if (this.stats.orderStats) {
      this.orderChartData = {
        ...this.orderChartData,
        datasets: [{
          data: [
            this.stats.orderStats.pendingOrders || 0,
            this.stats.orderStats.processingOrders || 0,
            this.stats.orderStats.completedOrders || 0,
            this.stats.orderStats.cancelledOrders || 0
          ],
          backgroundColor: ['#faad14', '#1890ff', '#52c41a', '#ff4d4f'],
          hoverBackgroundColor: ['#ffc53d', '#40a9ff', '#73d13d', '#ff7875']
        }]
      };
    }

    if (this.stats.productStats) {
      this.productPriceChartData = {
        ...this.productPriceChartData,
        datasets: [{
          label: 'Giá sản phẩm (VNĐ)',
          data: [
            this.stats.productStats.averagePrice || 0,
            this.stats.productStats.minPrice || 0,
            this.stats.productStats.maxPrice || 0
          ],
          backgroundColor: ['#1890ff', '#52c41a', '#ff4d4f'],
          borderColor: ['#096dd9', '#389e0d', '#cf1322'],
          borderWidth: 1
        }]
      };
    }

    setTimeout(() => {
      this.charts?.forEach(chart => {
        chart.chart?.update();
      });
    }, 100);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  startAutoRefresh(): void {
    if (this.autoRefreshEnabled) {
      this.autoRefreshInterval = setInterval(() => {
        this.loadDashboardData();
      }, this.refreshIntervalSeconds * 1000);
    }
  }

  stopAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  startLiveTrackingRefresh(): void {
    if (this.liveTrackingEnabled) {
      this.liveTrackingInterval = setInterval(() => {
        this.loadLiveTrackingBoard();
      }, this.liveTrackingRefreshSeconds * 1000);
    }
  }

  stopLiveTrackingRefresh(): void {
    if (this.liveTrackingInterval) {
      clearInterval(this.liveTrackingInterval);
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  toggleLiveTracking(): void {
    this.liveTrackingEnabled = !this.liveTrackingEnabled;
    if (this.liveTrackingEnabled) {
      this.startLiveTrackingRefresh();
      this.loadLiveTrackingBoard();
    } else {
      this.stopLiveTrackingRefresh();
    }
  }

  manualRefresh(): void {
    this.loadDashboardData();
  }

  refreshLiveTracking(): void {
    this.loadLiveTrackingBoard();
  }

  getTimeSinceUpdate(): string {
    const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ trước`;
  }

  getLiveTrackingAge(): string {
    const seconds = Math.floor((new Date().getTime() - this.liveTrackingUpdatedAt.getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ trước`;
  }

  getLiveStatusColor(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'DELIVERED':
        return 'green';
      case 'IN_TRANSIT':
        return 'blue';
      case 'PICKED_UP':
        return 'processing';
      case 'DELAYED':
        return 'warning';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  }
}
