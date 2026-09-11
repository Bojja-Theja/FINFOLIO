import { describe, it, expect, beforeAll } from 'vitest';
import { AccountabilityService } from '../services/accountabilityService';
import { DatabaseService } from '../services/databaseService';

describe('FinFolio Phase 4: Accountability Engine', () => {
  const testUserId = 88;
  const partnerEmail = 'mentor.sarah@example.com';

  describe('Partner Invitation, Acceptance & Revocation', () => {
    it('should successfully invite a new accountability partner in pending status', async () => {
      const partner = await AccountabilityService.invitePartner(
        testUserId,
        'Sarah Connor',
        partnerEmail,
        'Financial Mentor'
      );

      expect(partner).toBeDefined();
      expect(partner.id).toBeGreaterThan(0);
      expect(partner.userId).toBe(testUserId);
      expect(partner.name).toBe('Sarah Connor');
      expect(partner.email).toBe(partnerEmail);
      expect(partner.relationship).toBe('Financial Mentor');
      expect(partner.status).toBe('pending');
    });

    it('should reject duplicate partner invitation for the same email', async () => {
      await expect(
        AccountabilityService.invitePartner(testUserId, 'Sarah Clone', partnerEmail, 'Friend')
      ).rejects.toThrow(/already exists/i);
    });

    it('should reject partner invitation with empty name or email', async () => {
      await expect(
        AccountabilityService.invitePartner(testUserId, '', 'valid@example.com')
      ).rejects.toThrow(/required/i);

      await expect(
        AccountabilityService.invitePartner(testUserId, 'Name', '')
      ).rejects.toThrow(/required/i);
    });

    it('should allow partner to accept invitation using their registered email', async () => {
      const partners = await AccountabilityService.getPartners(testUserId);
      const pendingPartner = partners.find(p => p.email === partnerEmail);
      expect(pendingPartner).toBeDefined();

      const accepted = await AccountabilityService.acceptInvitation(
        pendingPartner!.id,
        partnerEmail
      );

      expect(accepted.status).toBe('active');
    });

    it('should prevent acceptance if email does not match invitation', async () => {
      const partners = await AccountabilityService.getPartners(testUserId);
      const partner = partners.find(p => p.email === partnerEmail);

      await expect(
        AccountabilityService.acceptInvitation(partner!.id, 'imposter@example.com')
      ).rejects.toThrow(/does not match/i);
    });

    it('should revoke an accountability partner and deactivate relationship', async () => {
      const partner2 = await AccountabilityService.invitePartner(
        testUserId,
        'John Coach',
        'coach.john@example.com',
        'Coach'
      );
      await AccountabilityService.acceptInvitation(partner2.id, 'coach.john@example.com');

      const success = await AccountabilityService.revokePartner(testUserId, partner2.id);
      expect(success).toBe(true);

      const activePartners = await AccountabilityService.getPartners(testUserId);
      const found = activePartners.find(p => p.id === partner2.id);
      expect(found).toBeUndefined(); // inactive partners are filtered from active list
    });
  });

  describe('3-Tier Commitment Rules Engine', () => {
    const userWithRules = 89;

    it('should initialize default 3-tier rules if none exist for user', async () => {
      const rules = await AccountabilityService.getCommitmentRules(userWithRules);
      expect(rules.length).toBeGreaterThanOrEqual(3);

      const essential = rules.find(r => r.level === 'low');
      const important = rules.find(r => r.level === 'medium');
      const discretionary = rules.find(r => r.level === 'high');

      expect(essential).toBeDefined();
      expect(essential!.requiresApproval).toBe(false);

      expect(important).toBeDefined();
      expect(important!.requiresApproval).toBe(true);
      expect(important!.maxInstantAmount).toBe(100);

      expect(discretionary).toBeDefined();
      expect(discretionary!.requiresApproval).toBe(true);
      expect(discretionary!.maxInstantAmount).toBe(0);
    });

    it('should create and update a custom commitment rule', async () => {
      const created = await AccountabilityService.setCommitmentRule(userWithRules, {
        category: 'Electronics & Tech Gadgets',
        level: 'medium',
        requiresApproval: true,
        maxInstantAmount: 150,
      });

      expect(created.category).toBe('Electronics & Tech Gadgets');
      expect(created.level).toBe('medium');
      expect(created.maxInstantAmount).toBe(150);

      const updated = await AccountabilityService.setCommitmentRule(userWithRules, {
        id: created.id,
        category: 'Electronics & Tech Gadgets',
        level: 'strict',
        requiresApproval: true,
        maxInstantAmount: 0,
      });

      expect(updated.level).toBe('strict');
      expect(updated.requiresApproval).toBe(true);
      expect(updated.maxInstantAmount).toBe(0);
    });

    it('should evaluate Essential tier correctly without requiring approval', async () => {
      const evalGrocery = await AccountabilityService.evaluateRequirement(
        userWithRules,
        85.5,
        'Groceries'
      );
      expect(evalGrocery.requiresApproval).toBe(false);
      expect(evalGrocery.tier).toBe('essential');

      const evalRent = await AccountabilityService.evaluateRequirement(
        userWithRules,
        1500,
        'Rent & Housing'
      );
      expect(evalRent.requiresApproval).toBe(false);
      expect(evalRent.tier).toBe('essential');
    });

    it('should evaluate Important tier with threshold logic', async () => {
      // Under $100 instant threshold
      const evalUnder = await AccountabilityService.evaluateRequirement(
        userWithRules,
        45,
        'Transportation'
      );
      expect(evalUnder.requiresApproval).toBe(false);
      expect(evalUnder.tier).toBe('important');

      // Exceeding $100 threshold
      const evalOver = await AccountabilityService.evaluateRequirement(
        userWithRules,
        250,
        'Transportation'
      );
      expect(evalOver.requiresApproval).toBe(true);
      expect(evalOver.tier).toBe('important');
      expect(evalOver.reason).toContain('exceeds instant threshold');
    });

    it('should evaluate Discretionary tier as always requiring approval', async () => {
      const evalDining = await AccountabilityService.evaluateRequirement(
        userWithRules,
        60,
        'Luxury Dining & Cocktails'
      );
      expect(evalDining.requiresApproval).toBe(true);
      expect(evalDining.tier).toBe('discretionary');
    });
  });

  describe('Server-Side Privacy Boundaries & Partner Approval Workflow', () => {
    const requesterUserId = 90;
    const trustedPartnerEmail = 'mentor.clara@example.com';

    beforeAll(async () => {
      // Setup partner relationship
      const partner = await AccountabilityService.invitePartner(
        requesterUserId,
        'Clara Oswald',
        trustedPartnerEmail,
        'Accountability Partner'
      );
      await AccountabilityService.acceptInvitation(partner.id, trustedPartnerEmail);

      // Link partner to discretionary rule
      await AccountabilityService.setCommitmentRule(requesterUserId, {
        category: 'High-End Gaming',
        level: 'high',
        requiresApproval: true,
        maxInstantAmount: 0,
        partnerId: partner.id,
      });
    });

    it('should strictly sanitize partner view to exclude user private finances', async () => {
      // Create a withdrawal request for requester
      const request = await DatabaseService.createWithdrawalRequest({
        userId: requesterUserId,
        walletId: 1,
        amount: 450,
        category: 'High-End Gaming',
        reason: 'New VR headset release',
        status: 'pending',
        estimatedDelayDays: 24,
        runwayImpactMonths: 0.35,
        isEmergency: false,
        isOverride: false,
      });

      const partnerInbox = await AccountabilityService.getPartnerInbox(trustedPartnerEmail);
      expect(partnerInbox.length).toBeGreaterThan(0);

      const target = partnerInbox.find(r => r.id === request.id);
      expect(target).toBeDefined();

      // Verified visible metrics:
      expect(target!.amount).toBe(450);
      expect(target!.category).toBe('High-End Gaming');
      expect(target!.reason).toBe('New VR headset release');
      expect(target!.estimatedDelayDays).toBe(24);
      expect(target!.runwayImpactMonths).toBe(0.35);

      // STRICT PRIVACY VERIFICATION: Confirm private properties are NOT exposed
      const partnerDataKeys = Object.keys(target!);
      expect(partnerDataKeys).not.toContain('walletBalance');
      expect(partnerDataKeys).not.toContain('monthlyIncome');
      expect(partnerDataKeys).not.toContain('monthlyExpenses');
      expect(partnerDataKeys).not.toContain('debtAmount');
      expect(partnerDataKeys).not.toContain('transactions');
    });

    it('should allow authorized partner to approve request with notes', async () => {
      const request = await DatabaseService.createWithdrawalRequest({
        userId: requesterUserId,
        walletId: 1,
        amount: 120,
        category: 'High-End Gaming',
        reason: 'Steam summer sale game bundle',
        status: 'pending',
        estimatedDelayDays: 7,
        runwayImpactMonths: 0.1,
        isEmergency: false,
        isOverride: false,
      });

      const result = await AccountabilityService.recordPartnerDecision(
        trustedPartnerEmail,
        request.id,
        'approved',
        'Looks reasonable and within entertainment budget.'
      );

      expect(result.status).toBe('approved');
      expect(result.partnerNotes).toBe('Looks reasonable and within entertainment budget.');
      expect(result.decisionDate).toBeDefined();

      // Check in database
      const fetched = await DatabaseService.getWithdrawalRequestById(request.id);
      expect(fetched!.status).toBe('approved');
    });

    it('should allow authorized partner to decline request with guidance notes', async () => {
      const request = await DatabaseService.createWithdrawalRequest({
        userId: requesterUserId,
        walletId: 1,
        amount: 800,
        category: 'High-End Gaming',
        reason: 'Custom mechanical keyboard collection',
        status: 'pending',
        estimatedDelayDays: 45,
        runwayImpactMonths: 0.8,
        isEmergency: false,
        isOverride: false,
      });

      const result = await AccountabilityService.recordPartnerDecision(
        trustedPartnerEmail,
        request.id,
        'declined',
        'You are 2 months away from your emergency fund goal. Postpone this purchase!'
      );

      expect(result.status).toBe('declined');
      expect(result.partnerNotes).toContain('emergency fund goal');
    });

    it('should reject decision from unauthorized partner', async () => {
      const request = await DatabaseService.createWithdrawalRequest({
        userId: requesterUserId,
        walletId: 1,
        amount: 200,
        category: 'High-End Gaming',
        reason: 'Concert tickets',
        status: 'pending',
        estimatedDelayDays: 14,
        runwayImpactMonths: 0.2,
        isEmergency: false,
        isOverride: false,
      });

      await expect(
        AccountabilityService.recordPartnerDecision(
          'stranger@example.com',
          request.id,
          'approved'
        )
      ).rejects.toThrow(/not authorized/i);
    });

    it('should reject decision on already resolved request', async () => {
      const request = await DatabaseService.createWithdrawalRequest({
        userId: requesterUserId,
        walletId: 1,
        amount: 150,
        category: 'High-End Gaming',
        reason: 'Speakers',
        status: 'pending',
        estimatedDelayDays: 10,
        runwayImpactMonths: 0.15,
        isEmergency: false,
        isOverride: false,
      });

      await AccountabilityService.recordPartnerDecision(
        trustedPartnerEmail,
        request.id,
        'approved',
        'Approved first time.'
      );

      await expect(
        AccountabilityService.recordPartnerDecision(
          trustedPartnerEmail,
          request.id,
          'declined',
          'Cannot decline now.'
        )
      ).rejects.toThrow(/Cannot decide request in 'approved' state/i);
    });
  });
});
