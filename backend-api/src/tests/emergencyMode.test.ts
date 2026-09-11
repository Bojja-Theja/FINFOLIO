import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { EmergencyService } from '../services/emergencyService.js';
import { WithdrawalService } from '../services/withdrawalService.js';
import { WalletService } from '../services/walletService.js';
import { AccountabilityService } from '../services/accountabilityService.js';
import { DatabaseService } from '../services/databaseService.js';

describe('FinFolio Phase 6: Emergency Mode & Pattern Anomaly Detection', () => {
  const userId = 201;
  const partnerEmail = 'emergency-partner@example.com';

  beforeAll(async () => {
    DatabaseService.resetInMemoryState();
    // Seed user wallet with initial funds
    await WalletService.deposit(userId, 2000, 'initial_deposit', 'Seed wallet for emergency tests');

    // Add active accountability partner
    const partner = await AccountabilityService.invitePartner(
      userId,
      'Trusted Partner',
      partnerEmail,
      'family'
    );
    await AccountabilityService.acceptInvitation(partner.id, partnerEmail);

    // Set a strict commitment rule that would normally require approval for everything
    await AccountabilityService.setCommitmentRule(userId, {
      category: 'Medical Urgent',
      level: 'strict',
      requiresApproval: true,
      maxInstantAmount: 0,
    });
  });

  describe('Emergency Immediate Execution & Security Invariants', () => {
    it('should immediately execute emergency withdrawal bypassing strict partner approval rules', async () => {
      const balanceBefore = (await WalletService.getWallet(userId)).balance;

      const result = await EmergencyService.executeEmergencyWithdrawal(
        userId,
        300,
        'Urgent emergency dental prescription',
        'Medical Urgent'
      );

      expect(result.request.status).toBe('executed');
      expect(result.request.isEmergency).toBe(true);
      expect(result.transaction.amount).toBe(300);
      expect(result.transaction.type).toBe('withdrawal');

      const balanceAfter = (await WalletService.getWallet(userId)).balance;
      expect(balanceAfter).toBe(balanceBefore - 300);
    });

    it('should strictly reject emergency withdrawal exceeding current wallet balance', async () => {
      const wallet = await WalletService.getWallet(userId);

      await expect(
        EmergencyService.executeEmergencyWithdrawal(
          userId,
          wallet.balance + 500,
          'Attempted overdraw',
          'emergency'
        )
      ).rejects.toThrow(/insufficient/i);
    });

    it('should reject emergency withdrawal with negative or zero amount', async () => {
      await expect(
        EmergencyService.executeEmergencyWithdrawal(userId, 0, 'Zero amount', 'emergency')
      ).rejects.toThrow(/greater than zero/i);

      await expect(
        EmergencyService.executeEmergencyWithdrawal(userId, -100, 'Negative amount', 'emergency')
      ).rejects.toThrow(/greater than zero/i);
    });

    it('should reject emergency withdrawal without a specific reason', async () => {
      await expect(
        EmergencyService.executeEmergencyWithdrawal(userId, 50, '   ', 'emergency')
      ).rejects.toThrow(/reason is required/i);
    });
  });

  describe('Post-Execution Partner Notification & Audit Trail', () => {
    it('should notify active accountability partners after emergency withdrawal executes', async () => {
      const result = await EmergencyService.executeEmergencyWithdrawal(
        userId,
        150,
        'Emergency home plumbing leak repair',
        'Home Repair'
      );

      expect(result.partnersNotified).toBeGreaterThanOrEqual(1);

      // Verify partner notification feed
      const notifications = await EmergencyService.getNotifications(undefined, partnerEmail);
      expect(notifications.length).toBeGreaterThanOrEqual(1);

      const alert = notifications.find(n => n.type === 'emergency_withdrawal');
      expect(alert).toBeDefined();
      expect(alert?.title).toContain('Emergency Withdrawal');
      expect(alert?.message).toContain('150');
      expect(alert?.read).toBe(false);

      // Verify marking notification as read
      if (alert) {
        const marked = await EmergencyService.markNotificationRead(alert.id);
        expect(marked).toBe(true);

        const updatedNotifications = await EmergencyService.getNotifications(undefined, partnerEmail);
        const updatedAlert = updatedNotifications.find(n => n.id === alert.id);
        expect(updatedAlert?.read).toBe(true);
      }
    });

    it('should record immutable audit log for emergency withdrawal', async () => {
      await EmergencyService.executeEmergencyWithdrawal(
        userId,
        100,
        'Urgent replacement tire',
        'Vehicle'
      );

      const auditLogs = DatabaseService.getInMemoryAuditLogs(userId);
      const emergencyAudit = auditLogs.find(
        a => a.action === 'emergency_withdrawal_executed' && a.details.category === 'Vehicle'
      );
      expect(emergencyAudit).toBeDefined();
      expect(emergencyAudit.details.amount).toBe(100);
      expect(emergencyAudit.details.category).toBe('Vehicle');
    });
  });

  describe('Objective Pattern Anomaly & Misuse Detection', () => {
    it('should detect frequent emergency withdrawals and output supportive, non-accusatory advice', async () => {
      // Execute another emergency withdrawal in quick succession
      const result = await EmergencyService.executeEmergencyWithdrawal(
        userId,
        120,
        'Prescription refill',
        'Medical'
      );

      expect(result.anomaly.anomalyDetected).toBe(true);
      expect(result.anomaly.recentEmergencyCount7d).toBeGreaterThanOrEqual(2);

      const warningText = result.anomaly.warnings.join(' ');
      // Must contain supportive guidance, NEVER accusatory words
      expect(warningText).toContain('reviewing your emergency fund');
      expect(warningText).not.toContain('abusing');
      expect(warningText).not.toContain('lying');
      expect(warningText).not.toContain('fraud');
    });

    it('should flag high wallet balance depletion (>50%)', async () => {
      const wallet = await WalletService.getWallet(userId);
      // Attempt withdrawal of > 50% of remaining balance
      const largeAmount = Math.floor(wallet.balance * 0.6);

      const result = await EmergencyService.executeEmergencyWithdrawal(
        userId,
        largeAmount,
        'Major unexpected family emergency',
        'Family'
      );

      expect(result.anomaly.anomalyDetected).toBe(true);
      expect(result.anomaly.balanceDepletionPercent).toBeGreaterThanOrEqual(50);
      const warningText = result.anomaly.warnings.join(' ');
      expect(warningText).toContain('utilizes');
    });
  });

  describe('Integration with WithdrawalService', () => {
    it('should route isEmergency=true in WithdrawalService seamlessly to EmergencyService', async () => {
      const res = await WithdrawalService.createWithdrawalRequest(
        userId,
        50,
        'Medical Urgent',
        'Emergency prescription via general endpoint',
        undefined,
        true // isEmergency
      );

      expect(res.executed).toBe(true);
      expect(res.request.isEmergency).toBe(true);
      expect(res.anomaly).toBeDefined();
      expect(res.message).toContain('Emergency withdrawal');
    });
  });
});
