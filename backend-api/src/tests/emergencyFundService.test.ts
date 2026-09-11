import { EmergencyFundService } from '../services/emergencyFundService';

describe('EmergencyFundService', () => {
    test('should return "excellent" status when balance covers > 12 months', () => {
        const status = EmergencyFundService.calculateEmergencyFundStatus(120000, 10000);
        expect(status.status).toBe('excellent');
        expect(status.monthsCoverage).toBe(12);
    });

    test('should return "critical" status when balance covers < 3 months', () => {
        const status = EmergencyFundService.calculateEmergencyFundStatus(20000, 10000);
        expect(status.status).toBe('critical');
        expect(status.alerts).toContain('CRITICAL: Emergency fund insufficient for basic emergencies');
    });

    test('should simulate scenarios correctly', () => {
        const simulations = EmergencyFundService.simulateEmergencyScenarios(50000, 10000, 15000);
        const jobLoss = simulations.find(s => s.scenario === 'Job Loss (3 months)');
        expect(jobLoss).toBeDefined();
        if (jobLoss) {
            expect(jobLoss.requiredAmount).toBe(30000);
            expect(jobLoss.currentShortfall).toBe(0);
        }
    });
});
