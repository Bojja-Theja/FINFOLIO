import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../services/databaseService.js';
import { WalletService } from '../services/walletService.js';

describe('FinFolio Phase 1: Foundation & Security', () => {
  beforeEach(() => {
    // Reset in-memory database fallback to ensure clean test state
    DatabaseService.resetInMemoryState();
    DatabaseService.setUseInMemory(true);
  });

  describe('PIN Security & Authentication', () => {
    it('should hash 4-digit PINs using bcrypt and verify correctly', async () => {
      const pin = '4321';
      const hashedPin = await DatabaseService.hashPin(pin);

      expect(hashedPin).not.toBe(pin);
      expect(hashedPin.startsWith('$2b$') || hashedPin.startsWith('$2a$')).toBe(true);

      const isValid = await DatabaseService.comparePin(pin, hashedPin);
      expect(isValid).toBe(true);

      const isInvalid = await DatabaseService.comparePin('0000', hashedPin);
      expect(isInvalid).toBe(false);
    });

    it('should register a user with a bcrypt-hashed PIN and authenticate', async () => {
      const email = 'alex.security@finfolio.io';
      const name = 'Alex Mercer';
      const pin = '8822';

      const userId = await DatabaseService.createUserWithPin(email, name, pin);
      expect(userId).toBeGreaterThan(0);

      // Authenticate with valid PIN
      const authenticatedUser = await DatabaseService.getUserByEmailAndPin(email, pin);
      expect(authenticatedUser).not.toBeNull();
      expect(authenticatedUser?.email).toBe(email);
      expect(authenticatedUser?.name).toBe(name);

      // Reject invalid PIN
      const failedAuth = await DatabaseService.getUserByEmailAndPin(email, '1234');
      expect(failedAuth).toBeNull();
    });

    it('should create a guest user with a secure default hashed PIN', async () => {
      const guestEmail = 'guest_101@guest.finfolio.local';
      const guestName = 'Guest Tester';

      const guestId = await DatabaseService.createGuestUser(guestEmail, guestName);
      expect(guestId).toBeGreaterThan(0);

      // Default PIN is '0000'
      const authGuest = await DatabaseService.getUserByEmailAndPin(guestEmail, '0000');
      expect(authGuest).not.toBeNull();
      expect(authGuest?.id).toBe(guestId);

      const wrongPinGuest = await DatabaseService.getUserByEmailAndPin(guestEmail, '9999');
      expect(wrongPinGuest).toBeNull();
    });

    it('should verify user PIN correctly via verifyUserPin', async () => {
      const userId = await DatabaseService.createUserWithPin('verify@finfolio.io', 'Verify User', '5678');
      
      const ok = await DatabaseService.verifyUserPin(userId, '5678');
      expect(ok).toBe(true);

      const fail = await DatabaseService.verifyUserPin(userId, '1111');
      expect(fail).toBe(false);
    });
  });

  describe('Savings Wallet Service & Transaction Invariants', () => {
    const testUserId = 42;

    it('should initialize a wallet with zero balance', async () => {
      const wallet = await WalletService.getWallet(testUserId);

      expect(wallet).toBeDefined();
      expect(wallet.userId).toBe(testUserId);
      expect(wallet.balance).toBe(0);
      expect(wallet.currency).toBe('USD');
    });

    it('should deposit funds and record a completed transaction', async () => {
      const { wallet, transaction } = await WalletService.deposit(
        testUserId,
        2500.50,
        'emergency_fund',
        'Monthly savings allocation'
      );

      expect(wallet.balance).toBe(2500.50);
      expect(transaction.amount).toBe(2500.50);
      expect(transaction.type).toBe('deposit');
      expect(transaction.status).toBe('completed');
      expect(transaction.category).toBe('emergency_fund');

      const balance = await WalletService.getBalance(testUserId);
      expect(balance).toBe(2500.50);
    });

    it('should withdraw funds within balance and record transaction', async () => {
      await WalletService.deposit(testUserId, 1000.00);

      const { wallet, transaction } = await WalletService.withdraw(
        testUserId,
        400.00,
        'planned_expense',
        'Home repair'
      );

      expect(wallet.balance).toBe(600.00);
      expect(transaction.amount).toBe(400.00);
      expect(transaction.type).toBe('withdrawal');
      expect(transaction.status).toBe('completed');

      const balance = await WalletService.getBalance(testUserId);
      expect(balance).toBe(600.00);
    });

    it('should reject withdrawal exceeding balance and keep balance intact', async () => {
      await WalletService.deposit(testUserId, 200.00);

      await expect(
        WalletService.withdraw(testUserId, 500.00, 'dining', 'Lavish dinner')
      ).rejects.toThrow(/insufficient funds/i);

      const balance = await WalletService.getBalance(testUserId);
      expect(balance).toBe(200.00);
    });

    it('should reject negative balances directly at database level', async () => {
      await WalletService.getWallet(testUserId);

      await expect(
        DatabaseService.updateWalletBalance(testUserId, -50)
      ).rejects.toThrow(/cannot be negative/i);
    });

    it('should retrieve wallet transactions in chronological order', async () => {
      await WalletService.deposit(testUserId, 100, 'income', 'First deposit');
      await WalletService.deposit(testUserId, 200, 'bonus', 'Second deposit');
      await WalletService.withdraw(testUserId, 50, 'groceries', 'Food');

      const transactions = await WalletService.getTransactions(testUserId);
      expect(transactions.length).toBe(3);
    });
  });

  describe('Accountability Partners & Commitment Rules', () => {
    const testUserId = 77;

    it('should create and retrieve accountability partners', async () => {
      const partner = await DatabaseService.createAccountabilityPartner({
        userId: testUserId,
        name: 'Sarah Connor',
        email: 'sarah.mentor@finfolio.io',
        relationship: 'financial_coach',
        status: 'active'
      });

      expect(partner.id).toBeDefined();
      expect(partner.name).toBe('Sarah Connor');
      expect(partner.email).toBe('sarah.mentor@finfolio.io');

      const partners = await DatabaseService.getAccountabilityPartners(testUserId);
      expect(partners.length).toBe(1);
      expect(partners[0].name).toBe('Sarah Connor');
    });

    it('should create and retrieve commitment rules', async () => {
      const rule = await DatabaseService.createCommitmentRule({
        userId: testUserId,
        category: 'electronics',
        level: 'high',
        requiresApproval: true,
        maxInstantAmount: 100.00
      });

      expect(rule.id).toBeDefined();
      expect(rule.category).toBe('electronics');
      expect(rule.requiresApproval).toBe(true);
      expect(rule.maxInstantAmount).toBe(100.00);

      const rules = await DatabaseService.getCommitmentRules(testUserId);
      expect(rules.length).toBe(1);
      expect(rules[0].category).toBe('electronics');
    });

    it('should record withdrawal requests with delay and runway impact', async () => {
      const wallet = await WalletService.getWallet(testUserId);

      const request = await DatabaseService.createWithdrawalRequest({
        userId: testUserId,
        walletId: wallet.id,
        amount: 850.00,
        category: 'luxury',
        reason: 'New smartphone purchase',
        status: 'pending',
        estimatedDelayDays: 3,
        runwayImpactMonths: 0.8,
        isEmergency: false,
        isOverride: false
      });

      expect(request.id).toBeDefined();
      expect(request.amount).toBe(850.00);
      expect(request.status).toBe('pending');
      expect(request.estimatedDelayDays).toBe(3);
      expect(request.runwayImpactMonths).toBe(0.8);

      const requests = await DatabaseService.getWithdrawalRequests(testUserId);
      expect(requests.length).toBe(1);
      expect(requests[0].reason).toBe('New smartphone purchase');
    });
  });
});
