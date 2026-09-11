
import { query } from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // 1. Seed Demo User
        const demoEmail = 'demo@capstack.com';
        const passwordHash = await bcrypt.hash('password123', 10);

        // Check if user exists
        const userCheck = await query('SELECT id FROM users WHERE email = $1', [demoEmail]);

        let userId;
        if (userCheck.rows.length === 0) {
            console.log('Creating demo user...');
            const userRes = await query(
                `INSERT INTO users (name, email, pin, is_guest) 
         VALUES ($1, $2, $3, false) RETURNING id`,
                ['Demo User', demoEmail, '1234']
            );
            userId = userRes.rows[0].id;
        } else {
            console.log('Demo user already exists.');
            userId = userCheck.rows[0].id;
        }

        // 2. Seed Financial Profile
        console.log('Seeding financial profile...');
        await query(
            `INSERT INTO user_financial_profiles (user_id, income_bracket, age_group, health_score, survival_period)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET 
       income_bracket = EXCLUDED.income_bracket,
       age_group = EXCLUDED.age_group,
       health_score = EXCLUDED.health_score,
       survival_period = EXCLUDED.survival_period`,
            [userId, '$50K-$75K', '25-34', 85, 4.5]
        );

        // 3. Seed Asset Allocation
        console.log('Seeding asset allocation...');
        await query(
            `INSERT INTO asset_allocations 
       (user_id, sip_percentage, stocks_percentage, bonds_percentage, lifestyle_percentage, emergency_fund_percentage, 
        monthly_income, sip_amount, stocks_amount, bonds_amount, lifestyle_amount, emergency_amount)
       VALUES ($1, 30.00, 15.00, 20.00, 25.00, 10.00, 60000.00, 18000.00, 9000.00, 12000.00, 15000.00, 6000.00)
       ON CONFLICT (user_id) DO UPDATE SET
       monthly_income = EXCLUDED.monthly_income,
       sip_amount = EXCLUDED.sip_amount`,
            [userId]
        );

        // 4. Seed Emergency Fund
        console.log('Seeding emergency fund...');
        await query(
            `INSERT INTO emergency_fund_monitoring
       (user_id, current_balance, target_months, monthly_burn_rate, months_coverage, status)
       VALUES ($1, 120000.00, 6, 25000.00, 4.8, 'good')
       ON CONFLICT (user_id) DO UPDATE SET
       current_balance = EXCLUDED.current_balance`,
            [userId]
        );

        // 5. Seed User Profile (001 schema)
        console.log('Seeding user profile (base)...');
        await query(
            `INSERT INTO user_profiles (user_id, monthly_income, monthly_expenses, emergency_fund, savings_rate, location, industry, experience_years)
       VALUES ($1, 60000.00, 25000.00, 120000.00, 0.40, 'Bangalore', 'Technology', 5)
       ON CONFLICT (user_id) DO UPDATE SET
       monthly_income = EXCLUDED.monthly_income`,
            [userId]
        );

        // 6. Seed Savings Plans
        console.log('Seeding savings plans...');
        await query('DELETE FROM savings_plans WHERE user_id = $1', [userId]);
        await query(
            `INSERT INTO savings_plans (user_id, name, target_amount, current_amount, monthly_contribution, lock_percentage, target_date)
       VALUES 
       ($1, 'Emergency Fund', 150000.00, 120000.00, 5000.00, 0.80, '2025-12-31'),
       ($1, 'Vacation', 100000.00, 25000.00, 3000.00, 0.50, '2025-08-01')`,
            [userId]
        );

        // 7. Seed Alerts
        console.log('Seeding alerts...');
        await query('DELETE FROM alerts WHERE user_id = $1', [userId]);
        await query(
            `INSERT INTO alerts (user_id, type, title, message, priority, category)
       VALUES 
       ($1, 'warning', 'Slightly high spending', 'Your dining expenses are 15% higher than usual this month.', 'medium', 'spending'),
       ($1, 'success', 'Savings Goal Reached', 'You hit your monthly savings target!', 'medium', 'savings')`,
            [userId]
        );

        // Investment Portfolios
        console.log('Seeding investment portfolios...');
        await query('DELETE FROM investment_portfolios WHERE user_id = $1', [userId]);
        await query(
            `INSERT INTO investment_portfolios (user_id, asset_type, name, invested_amount, current_value, risk_level)
        VALUES 
        ($1, 'stocks', 'Nifty 50 ETF', 50000.00, 55000.00, 'medium'),
        ($1, 'sip', 'Bluechip Fund', 120000.00, 135000.00, 'medium'),
        ($1, 'bonds', 'Govt Bonds', 30000.00, 31000.00, 'low')`,
            [userId]
        );

        console.log('✅ Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
