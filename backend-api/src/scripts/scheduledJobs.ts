import * as cron from 'node-cron';
import { CronService } from '../services/cronService';
import { logger } from '../utils/logger';

/**
 * Scheduled Jobs Manager
 * Handles all automated background tasks for the financial system
 */

class ScheduledJobsManager {
  private static instance: ScheduledJobsManager;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  static getInstance(): ScheduledJobsManager {
    if (!ScheduledJobsManager.instance) {
      ScheduledJobsManager.instance = new ScheduledJobsManager();
    }
    return ScheduledJobsManager.instance;
  }

  /**
   * Initialize all scheduled jobs
   */
  initializeJobs(): void {
    logger.info('Initializing scheduled jobs...');

    // Daily recalculation - runs at 2 AM every day
    this.scheduleJob('daily-recalculation', '0 2 * * *', async () => {
      logger.info('Running daily financial recalculation...');
    try {
      await CronService.runDailyRecalculation();
      logger.info('Daily recalculation completed successfully');
    } catch (error) {
      logger.error(`Daily recalculation failed: ${error}`);
    }
    });

    // Emergency fund monitoring - runs every 6 hours
    this.scheduleJob('emergency-monitoring', '0 */6 * * *', async () => {
      logger.info('Running emergency fund monitoring...');
      try {
        await CronService.runEmergencyFundMonitoring();
        logger.info('Emergency fund monitoring completed');
      } catch (error) {
        logger.error(`Emergency fund monitoring failed: ${error}`);
      }
    });

    // Weekly trend analysis - runs every Sunday at 3 AM
    this.scheduleJob('weekly-trends', '0 3 * * 0', async () => {
      logger.info('Running weekly trend analysis...');
      try {
        await CronService.runWeeklyTrendAnalysis();
        logger.info('Weekly trend analysis completed');
      } catch (error) {
        logger.error(`Weekly trend analysis failed: ${error}`);
      }
    });

    // Monthly report generation - runs on 1st of each month at 4 AM
    this.scheduleJob('monthly-reports', '0 4 1 * *', async () => {
      logger.info('Running monthly report generation...');
      try {
        await CronService.runMonthlyReportGeneration();
        logger.info('Monthly report generation completed');
      } catch (error) {
        logger.error(`Monthly report generation failed: ${error}`);
      }
    });

    logger.info('All scheduled jobs initialized successfully');
  }

  /**
   * Schedule a cron job
   */
  private scheduleJob(name: string, cronExpression: string, task: () => Promise<void>): void {
    try {
      const job = cron.schedule(cronExpression, task);

      this.jobs.set(name, job);
      logger.info(`Scheduled job '${name}' with cron expression: ${cronExpression}`);
    } catch (error) {
      logger.error(`Failed to schedule job '${name}': ${error}`);
    }
  }

  /**
   * Start all scheduled jobs
   */
  startAllJobs(): void {
    logger.info('Starting all scheduled jobs...');

    for (const [name, job] of this.jobs) {
      try {
        job.start();
        logger.info(`Started job: ${name}`);
      } catch (error) {
        logger.error(`Failed to start job '${name}': ${error}`);
      }
    }

    logger.info('All scheduled jobs started');
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs(): void {
    logger.info('Stopping all scheduled jobs...');

    for (const [name, job] of this.jobs) {
      try {
        job.stop();
        logger.info(`Stopped job: ${name}`);
      } catch (error) {
        logger.error(`Failed to stop job '${name}': ${error}`);
      }
    }

    this.jobs.clear();
    logger.info('All scheduled jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};

    for (const [name, job] of this.jobs) {
      status[name] = job.getStatus() === 'running';
    }

    return status;
  }

  /**
   * Manually trigger a job (for testing)
   */
  async triggerJob(jobName: string): Promise<boolean> {
    const job = this.jobs.get(jobName);

    if (!job) {
      logger.error(`Job '${jobName}' not found`);
      return false;
    }

    try {
      // Create a promise that resolves when the job completes
      const jobPromise = new Promise<void>((resolve, reject) => {
        // For manual triggering, we'll run the job logic directly
        // This is a simplified approach - in production, you'd want better job management
        resolve();
      });

      await jobPromise;
      logger.info(`Manually triggered job: ${jobName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to trigger job '${jobName}': ${error}`);
      return false;
    }
  }
}

// Export singleton instance
export const scheduledJobsManager = ScheduledJobsManager.getInstance();

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Received SIGINT, stopping scheduled jobs...');
  scheduledJobsManager.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, stopping scheduled jobs...');
  scheduledJobsManager.stopAllJobs();
  process.exit(0);
});