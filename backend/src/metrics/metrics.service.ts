import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  // HTTP Metrics
  public readonly httpRequestDuration: Histogram;
  public readonly httpRequestTotal: Counter;
  public readonly httpRequestErrors: Counter;

  // Business Metrics
  public readonly activeRentals: Gauge;
  public readonly toolsAvailable: Gauge;
  public readonly toolsRented: Gauge;
  public readonly totalUsers: Gauge;
  public readonly rentalCreated: Counter;
  public readonly rentalCompleted: Counter;
  public readonly userRegistrations: Counter;

  // System Metrics
  public readonly dbConnectionPool: Gauge;
  public readonly cacheHitRate: Counter;
  public readonly cacheMissRate: Counter;

  constructor() {
    this.registry = register;

    // ==================== HTTP Metrics ====================
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10], // seconds
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.registry],
    });

    // ==================== Business Metrics ====================
    this.activeRentals = new Gauge({
      name: 'rentals_active_total',
      help: 'Total number of active rentals',
      registers: [this.registry],
    });

    this.toolsAvailable = new Gauge({
      name: 'tools_available_total',
      help: 'Total number of available tools',
      registers: [this.registry],
    });

    this.toolsRented = new Gauge({
      name: 'tools_rented_total',
      help: 'Total number of currently rented tools',
      registers: [this.registry],
    });

    this.totalUsers = new Gauge({
      name: 'users_total',
      help: 'Total number of registered users',
      labelNames: ['role', 'status'],
      registers: [this.registry],
    });

    this.rentalCreated = new Counter({
      name: 'rentals_created_total',
      help: 'Total number of rentals created',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.rentalCompleted = new Counter({
      name: 'rentals_completed_total',
      help: 'Total number of rentals completed',
      registers: [this.registry],
    });

    this.userRegistrations = new Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['role'],
      registers: [this.registry],
    });

    // ==================== System Metrics ====================
    this.dbConnectionPool = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Database connection pool size',
      labelNames: ['state'],
      registers: [this.registry],
    });

    this.cacheHitRate = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_key'],
      registers: [this.registry],
    });

    this.cacheMissRate = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_key'],
      registers: [this.registry],
    });
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get metrics content type
   */
  getContentType(): string {
    return this.registry.contentType;
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);

    this.httpRequestTotal.labels(method, route, statusCode.toString()).inc();

    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
      this.httpRequestErrors.labels(method, route, errorType).inc();
    }
  }

  /**
   * Record rental creation
   */
  recordRentalCreated(status: string = 'pending') {
    this.rentalCreated.labels(status).inc();
  }

  /**
   * Record rental completion
   */
  recordRentalCompleted() {
    this.rentalCompleted.inc();
  }

  /**
   * Record user registration
   */
  recordUserRegistration(role: string = 'member') {
    this.userRegistrations.labels(role).inc();
  }

  /**
   * Update active rentals count
   */
  updateActiveRentals(count: number) {
    this.activeRentals.set(count);
  }

  /**
   * Update tools availability
   */
  updateToolsAvailability(available: number, rented: number) {
    this.toolsAvailable.set(available);
    this.toolsRented.set(rented);
  }

  /**
   * Update user counts
   */
  updateUserCounts(counts: { role: string; status: string; count: number }[]) {
    counts.forEach(({ role, status, count }) => {
      this.totalUsers.labels(role, status).set(count);
    });
  }

  /**
   * Record cache hit
   */
  recordCacheHit(cacheKey: string) {
    this.cacheHitRate.labels(cacheKey).inc();
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(cacheKey: string) {
    this.cacheMissRate.labels(cacheKey).inc();
  }

  /**
   * Update database connection pool metrics
   */
  updateDbConnectionPool(active: number, idle: number, waiting: number) {
    this.dbConnectionPool.labels('active').set(active);
    this.dbConnectionPool.labels('idle').set(idle);
    this.dbConnectionPool.labels('waiting').set(waiting);
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics() {
    this.registry.resetMetrics();
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.registry.clear();
  }
}
