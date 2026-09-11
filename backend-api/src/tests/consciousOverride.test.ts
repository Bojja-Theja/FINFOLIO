import { describe, it, expect, beforeAll } from 'vitest';
import { WithdrawalService } from '../services/withdrawalService';
import { WalletService } from '../services/walletService';
import { AccountabilityService } from '../services/accountabilityService';
import { DatabaseService } from '../services/databaseService';
import { EmergencyService } from '../services/emergencyService';

describe('FinFolio Phase 7: Conscious User Override', () => {
  const userId = 301;
  const partnerEmail = 'mentor-override@example.com';

  beforeAll(async () => {
    DatabaseService.resetInMemoryState();

    // Deposit funds in user wallet
    await WalletService.deposit(userId, 3000, 'initial_deposit', 'Seed wallet for override tests');

    // Add and accept active partner
    const partner = await AccountabilityService.invitePartner(
      userId,
      'Financial Mentor',
      partnerEmail,
      'mentor'
    );
    await AccountabilityService.acceptInvitation(partner.id, partnerEmail);

    // Set a strict discretionary rule that mandates partner review
    await AccountabilityService.setCommitmentRule(userId, {
      category: 'Electronics & Gadgets',
      level: 'strict',
      requiresApproval: true,
      maxInstantAmount: 0,
    });
  });

  describe('Conscious Override Execution & Constraints', () => {
    it('should reject conscious override if explicit consequence acknowledgement is missing', async () => {
      await expect(
        WithdrawalService.executeConsciousOverride(
          userId,
          250,
          'Electronics & Gadgets',
          'Noise cancelling headphones for deep work',
          '' // Empty acknowledgement
        )
      ).rejects.toThrow(/acknowledgement is required/i);
    });

    it('should reject conscious override exceeding current wallet balance', async () => {
      const wallet = await WalletService.getWallet(userId);

      await expect(
        WithdrawalService.executeConsciousOverride(
          userId,
          wallet.balance + 1000,
          'Electronics & Gadgets',
          'High-end laptop',
          'I understand this may delay my goal and reduce my financial runway.'
        )
      ).rejects.toThrow(/insufficient/i);
    });

    it('should execute conscious override immediately when consequence is explicitly acknowledged', async () => {
      const balanceBefore = (await WalletService.getWallet(userId)).balance;

      const result = await WithdrawalService.executeConsciousOverride(
        userId,
        400,
        'Electronics & Gadgets',
        'Noise cancelling headphones for work productivity',
        'I understand this may delay my goal and reduce my financial runway.'
      );

      expect(result.executed).toBe(true);
      expect(result.request.status).toBe('executed');
      expect(result.request.isOverride).toBe(true);
      expect(result.request.isEmergency).toBe(false);
      expect(result.request.partnerNotes).toContain('Conscious override acknowledged');
      expect(result.transaction?.amount).toBe(400);

      const balanceAfter = (await WalletService.getWallet(userId)).balance;
      expect(balanceAfter).toBe(balanceBefore - 400);
    });

    it('should record immutable audit log for conscious override', async () => {
      const auditLogs = DatabaseService.getInMemoryAuditLogs(userId);
      const overrideAudit = auditLogs.find(a => a.action === 'conscious_override_executed');

      expect(overrideAudit).toBeDefined();
      expect(overrideAudit.details.amount).toBe(400);
      expect(overrideAudit.details.category).toBe('Electronics & Gadgets');
      expect(overrideAudit.details.acknowledgement).toContain('delay my goal');
    });

    it('should notify active accountability partner of conscious override', async () => {
      const notifs = await EmergencyService.getNotifications(undefined, partnerEmail);
      const overrideNotif = notifs.find(n => n.type === 'withdrawal_decision');

      expect(overrideNotif).toBeDefined();
      expect(overrideNotif?.title).toContain('Conscious Override');
      expect(overrideNotif?.message).toContain('400');
    });

    it('should route isOverride=true in createWithdrawalRequest seamlessly', async () => {
      const result = await WithdrawalService.createWithdrawalRequest(
        userId,
        150,
        'Electronics & Gadgets',
        'Replacement mechanical keyboard',
        undefined,
        false, // isEmergency
        true // isOverride
      );

      expect(result.executed).toBe(true);
      expect(result.request.isOverride).toBe(true);
      expect(result.message).toContain('conscious override');
    });
  });
});
