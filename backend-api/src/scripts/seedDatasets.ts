import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { query } from '../config/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetPath = path.join(__dirname, '../../../../dataset');

type CsvPrimitive = string | number | null | undefined;
type CsvRow = Record<string, CsvPrimitive>;

async function seedDatasets() {
    try {
        console.log('🌱 Starting dataset migration and seeding...');

        // 1. Run migration SQL
        console.log('Running 007_attach_datasets.sql...');
        const sqlPath = path.join(__dirname, '../../../../database/migrations/007_attach_datasets.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        try {
            await query(sql);
            console.log('Migration executed successfully.');
        } catch (e: any) {
            console.log('Migration might have already run or failed:', e.message);
        }

        // 2. Clear existing entries
        await query('TRUNCATE TABLE dataset_salary RESTART IDENTITY CASCADE');
        await query('TRUNCATE TABLE dataset_turnover RESTART IDENTITY CASCADE');
        await query('TRUNCATE TABLE dataset_stock RESTART IDENTITY CASCADE');
        await query('TRUNCATE TABLE dataset_benefits RESTART IDENTITY CASCADE');

        // Helper to load CSV
        const loadCSV = <T extends CsvRow>(filename: string): T[] => {
            const filePath = path.join(datasetPath, filename);
            if (!fs.existsSync(filePath)) return [];
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                cast: (value, context) => {
                    if (context.column !== 'date' && context.column !== 'Date' && !isNaN(Number(value)) && value.trim() !== '') {
                        return Number(value);
                    }
                    return value;
                },
            }) as T[];
        };

        type SalaryCsvRow = CsvRow & { YearsExperience?: number; Salary?: number };
        type TurnoverCsvRow = CsvRow & {
            stag?: number;
            event?: number;
            gender?: string;
            age?: number;
            industry?: string;
            profession?: string;
            traffic?: string;
            coach?: string;
            head_gender?: string;
            greywage?: string;
            way?: string;
            extraversion?: number;
            independ?: number;
            selfcontrol?: number;
            anxiety?: number;
            novator?: number;
        };
        type StockCsvRow = CsvRow & { Date?: string; AMZN?: number; DPZ?: number; BTC?: number; NFLX?: number };
        type BenefitCsvRow = CsvRow & { job_id?: string; inferred?: number; type?: string };

        // 3. Seed Salary Data
        console.log('Seeding Salary Data...');
        const salaryData = loadCSV<SalaryCsvRow>('Salary.csv');
        for (const row of salaryData) {
            await query(
                'INSERT INTO dataset_salary (years_experience, salary) VALUES ($1, $2)',
                [row.YearsExperience || 0, row.Salary || 0]
            );
        }

        // 4. Seed Turnover Data
        console.log('Seeding Turnover Data...');
        const turnoverData = loadCSV<TurnoverCsvRow>('turnover.csv');
        for (const row of turnoverData) {
            await query(
                `INSERT INTO dataset_turnover (stag, event, gender, age, industry, profession, traffic, coach, head_gender, greywage, way, extraversion, independ, selfcontrol, anxiety, novator)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                [
                    row.stag || 0,
                    row.event || 0,
                    row.gender || '',
                    row.age || 0,
                    row.industry || '',
                    row.profession || '',
                    row.traffic || '',
                    row.coach || '',
                    row.head_gender || '',
                    row.greywage || '',
                    row.way || '',
                    row.extraversion || 0,
                    row.independ || 0,
                    row.selfcontrol || 0,
                    row.anxiety || 0,
                    row.novator || 0
                ]
            );
        }

        // 5. Seed Stock Data
        console.log('Seeding Stock Data...');
        const stockData = loadCSV<StockCsvRow>('stock/portfolio_data.csv');
        for (const row of stockData) {
            await query(
                'INSERT INTO dataset_stock (date, amzn, dpz, btc, nflx) VALUES ($1, $2, $3, $4, $5)',
                [row.Date, row.AMZN || 0, row.DPZ || 0, row.BTC || 0, row.NFLX || 0]
            );
        }

        // 6. Seed Benefits Data
        console.log('Seeding Benefits Data...');
        const benefitsData = loadCSV<BenefitCsvRow>('linkedinbenefits.csv');
        // Insert in batches or individually
        for (const row of benefitsData) {
            await query(
                'INSERT INTO dataset_benefits (job_id, inferred, type) VALUES ($1, $2, $3)',
                [row.job_id || '', row.inferred || 0, row.type || '']
            );
        }

        console.log('✅ Dataset seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Dataset seeding failed:', error);
        process.exit(1);
    }
}

seedDatasets();
