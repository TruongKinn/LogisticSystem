import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DashboardService } from '../../shared/services/dashboard.service';
import { DashboardStats } from '../../shared/models/dashboard-stats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzIconModule,
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
  refreshIntervalSeconds = 30; // Auto refresh every 30 seconds

  // User Chart Configuration
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

  // Order Chart Configuration
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

  // Product Price Chart Configuration
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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.dashboardService.getAllStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateCharts();
        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateCharts(): void {
    // Update User Chart - Create new object to trigger change detection
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

    // Update Order Chart - Create new object
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

    // Update Product Price Chart - Create new object
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

    // Trigger chart updates
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

  // Auto refresh methods
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

  toggleAutoRefresh(): void {
    this.autoRefreshEnabled = !this.autoRefreshEnabled;
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  manualRefresh(): void {
    this.loadDashboardData();
  }

  getTimeSinceUpdate(): string {
    const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ trước`;
  }
}
