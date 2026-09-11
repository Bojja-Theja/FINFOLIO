
import { query } from '../config/db';

async function checkData() {
    try {
        const userRes = await query('SELECT email FROM users WHERE email = $1', ['demo@capstack.com']);
        console.log('User check:', userRes.rows);

        const profileRes = await query('SELECT income_bracket FROM user_financial_profiles WHERE user_id = (SELECT id FROM users WHERE email = $1)', ['demo@capstack.com']);
        console.log('Profile check:', profileRes.rows);

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

checkData();
