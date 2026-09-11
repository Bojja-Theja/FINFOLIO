#!/usr/bin/env python3
"""
FINFOLIO - Dataset Analysis Engine
Analyzes 6 personal financial resilience, spending time-series, career skill, and macroeconomic datasets.
Generates a structured analytics summary in data/analytics_summary.json.
"""

import os
import csv
import json
import re
from collections import Counter, defaultdict
from statistics import mean, median

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def analyze_world_bank_unemployment():
    csv_path = os.path.join(DATA_DIR, 'world_bank_unemployment', 'india_unemployment_1991_2024.csv')
    records = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            val = float(r['UnemploymentRatePct'])
            records.append({
                'year': int(r['Year']),
                'rate': val
            })
    
    records.sort(key=lambda x: x['year'])
    rates = [r['rate'] for r in records]
    latest = records[-1]
    peak = max(records, key=lambda x: x['rate'])
    trough = min(records, key=lambda x: x['rate'])
    avg_rate = round(mean(rates), 2)
    recent_10yr = [r['rate'] for r in records[-10:]]
    recent_avg = round(mean(recent_10yr), 2)
    
    # Shock factor: ratio of peak shock to baseline
    labor_shock_factor = round(peak['rate'] / latest['rate'], 2)
    # Recommended baseline buffer in months based on unemployment volatility
    recommended_emergency_buffer_months = 6 if latest['rate'] > 6.0 else (4.5 if latest['rate'] > 4.5 else 3.5)

    return {
        'indicator': 'SL.UEM.TOTL.ZS (India Unemployment % of Total Labor Force)',
        'dataPoints': len(records),
        'startYear': records[0]['year'],
        'endYear': records[-1]['year'],
        'latest': {
            'year': latest['year'],
            'ratePct': latest['rate']
        },
        'historicalAveragePct': avg_rate,
        'recent10YrAveragePct': recent_avg,
        'peak': {
            'year': peak['year'],
            'ratePct': peak['rate']
        },
        'lowest': {
            'year': trough['year'],
            'ratePct': trough['rate']
        },
        'laborShockFactor': labor_shock_factor,
        'recommendedEmergencyBufferMonths': recommended_emergency_buffer_months,
        'yearlyHistory': records
    }

def analyze_indian_personal_finance():
    csv_path = os.path.join(DATA_DIR, 'indian_personal_finance', 'indian_personal_finance.csv')
    tier_data = defaultdict(list)
    resilience_scores = []
    savings_rates = []
    incomes = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            tier = r['City_Tier']
            inc = float(r['Monthly_Income_INR'])
            sav_rate = float(r['Savings_Rate_Pct'])
            disc_ratio = float(r['Discretionary_Ratio_Pct'])
            score = float(r['Financial_Resilience_Score'])
            em_months = float(r['Emergency_Fund_Months'])
            
            incomes.append(inc)
            savings_rates.append(sav_rate)
            resilience_scores.append(score)
            
            tier_data[tier].append({
                'income': inc,
                'rent': float(r['Rent_Housing_INR']),
                'food': float(r['Food_Groceries_INR']),
                'utilities': float(r['Utilities_Bills_INR']),
                'essential': float(r['Essential_Spending_INR']),
                'discretionary': float(r['Discretionary_Spending_INR']),
                'savingsRate': sav_rate,
                'discRatio': disc_ratio,
                'resilienceScore': score,
                'emergencyMonths': em_months
            })
            
    tier_summaries = {}
    for tier, rows in tier_data.items():
        tier_summaries[tier] = {
            'sampleCount': len(rows),
            'avgIncomeINR': round(mean(r['income'] for r in rows)),
            'medianIncomeINR': round(median(r['income'] for r in rows)),
            'avgEssentialExpensesINR': round(mean(r['essential'] for r in rows)),
            'avgDiscretionaryExpensesINR': round(mean(r['discretionary'] for r in rows)),
            'avgSavingsRatePct': round(mean(r['savingsRate'] for r in rows), 1),
            'avgDiscretionaryRatioPct': round(mean(r['discRatio'] for r in rows), 1),
            'avgResilienceScore': round(mean(r['resilienceScore'] for r in rows), 1),
            'avgEmergencyFundMonths': round(mean(r['emergencyMonths'] for r in rows), 1)
        }
        
    return {
        'totalSampleCount': len(incomes),
        'nationalAvgIncomeINR': round(mean(incomes)),
        'nationalMedianIncomeINR': round(median(incomes)),
        'nationalAvgSavingsRatePct': round(mean(savings_rates), 1),
        'nationalAvgResilienceScore': round(mean(resilience_scores), 1),
        'byCityTier': tier_summaries
    }

def analyze_monthly_spending():
    csv_path = os.path.join(DATA_DIR, 'monthly_spending', 'monthly_spending_india.csv')
    monthly_expenses = defaultdict(list)
    festive_spending = []
    normal_spending = []
    cpi_rates = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            m_name = r['Month_Name']
            exp = float(r['Total_Monthly_Expenses_INR'])
            festive = int(r['Festival_Season_Flag'])
            cpi = float(r['Inflation_CPI_Pct'])
            
            monthly_expenses[m_name].append(exp)
            cpi_rates.append(cpi)
            
            if festive == 1:
                festive_spending.append(exp)
            else:
                normal_spending.append(exp)
                
    month_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    base_avg = mean(normal_spending)
    seasonality_index = {}
    for m in month_order:
        if m in monthly_expenses:
            m_avg = mean(monthly_expenses[m])
            seasonality_index[m] = {
                'avgExpenseINR': round(m_avg),
                'seasonalityIndex': round(m_avg / base_avg, 2)
            }
            
    festive_surge_pct = round(((mean(festive_spending) - base_avg) / base_avg) * 100, 1)
    
    return {
        'avgInflationCPIPct': round(mean(cpi_rates), 2),
        'festivalSpikePct': festive_surge_pct,
        'festivalPeakMonths': ['October', 'November', 'March'],
        'monthlySeasonality': seasonality_index
    }

def analyze_resume_skills():
    csv_path = os.path.join(DATA_DIR, 'resume_skills_extraction', 'resume_skills_dataset.csv')
    categories = Counter()
    category_keywords = defaultdict(Counter)
    
    common_stops = {
        'and', 'the', 'for', 'with', 'in', 'of', 'to', 'a', 'on', 'as', 'by', 'an', 'at',
        'is', 'are', 'was', 'were', 'skills', 'experience', 'project', 'projects', 'details',
        'work', 'management', 'responsibilities', 'system', 'systems', 'team', 'company', 'india'
    }
    
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for r in reader:
            cat = r.get('Category', '').strip()
            resume_text = r.get('Resume', '').lower()
            if not cat:
                continue
            categories[cat] += 1
            words = re.findall(r'[a-zA-Z]{3,}', resume_text)
            for w in words:
                if w not in common_stops and len(w) > 3:
                    category_keywords[cat][w] += 1

    top_categories = dict(categories.most_common())
    domain_skills_summary = {}
    for cat, counter in category_keywords.items():
        domain_skills_summary[cat] = [word for word, _ in counter.most_common(12)]
        
    return {
        'totalResumes': sum(categories.values()),
        'uniqueDomains': len(categories),
        'categoryDistribution': top_categories,
        'domainKeySkills': domain_skills_summary
    }

def analyze_job_skills():
    csv_path = os.path.join(DATA_DIR, 'job_skills', 'job_skills.csv')
    companies = Counter()
    categories = Counter()
    qual_keywords = Counter()
    
    tech_terms = [
        'python', 'java', 'sql', 'c++', 'cloud', 'aws', 'gcp', 'azure', 'kubernetes',
        'docker', 'linux', 'git', 'rest', 'machine learning', 'data analysis',
        'agile', 'scrum', 'leadership', 'communication', 'ci/cd', 'terraform'
    ]
    
    total_postings = 0
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for r in reader:
            total_postings += 1
            comp = r.get('Company', 'Unknown').strip()
            cat = r.get('Category', 'Other').strip()
            if comp:
                companies[comp] += 1
            if cat:
                categories[cat] += 1
                
            quals = (r.get('Minimum Qualifications', '') + ' ' + r.get('Preferred Qualifications', '')).lower()
            for term in tech_terms:
                if term in quals:
                    qual_keywords[term] += 1
                    
    return {
        'totalJobPostings': total_postings,
        'topCategories': dict(categories.most_common(10)),
        'topDemandedSkills': [
            {'skill': term, 'mentions': count, 'frequencyPct': round((count / max(1, total_postings)) * 100, 1)}
            for term, count in qual_keywords.most_common(15)
        ]
    }

def analyze_ai_job_prediction():
    csv_path = os.path.join(DATA_DIR, 'ai_resume_job_prediction', 'job_role_prediction_dataset.csv')
    roles = Counter()
    skill_matches = []
    salary_growth = []
    transitions = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            cur_role = r['Current_Role']
            target_role = r['Target_Job_Role']
            match_pct = float(r['Skill_Match_Pct'])
            cur_sal = float(r['Current_Salary_INR'])
            tgt_sal = float(r['Target_Salary_INR'])
            growth_pct = ((tgt_sal - cur_sal) / max(1, cur_sal)) * 100
            
            roles[target_role] += 1
            skill_matches.append(match_pct)
            salary_growth.append(growth_pct)
            
            if len(transitions) < 15 and cur_role != target_role:
                transitions.append({
                    'currentRole': cur_role,
                    'targetRole': target_role,
                    'avgMatchPct': match_pct,
                    'upskilling': r['Upskilling_Recommendation'],
                    'expectedSalaryGrowthPct': round(growth_pct, 1)
                })
                
    return {
        'totalProfilesAnalyzed': len(skill_matches),
        'avgSkillMatchPct': round(mean(skill_matches), 1),
        'avgSalaryGrowthPotentialPct': round(mean(salary_growth), 1),
        'topTargetRoles': dict(roles.most_common(8)),
        'sampleCareerTransitions': transitions
    }

def main():
    print("=" * 60)
    print("FINFOLIO: Analyzing 6 Resilience & Career Datasets...")
    print("=" * 60)

    world_bank = analyze_world_bank_unemployment()
    print("✓ 1. World Bank India Unemployment Data Analyzed.")
    
    personal_finance = analyze_indian_personal_finance()
    print("✓ 2. Indian Personal Finance & Spending Habits Analyzed.")
    
    spending_time_series = analyze_monthly_spending()
    print("✓ 3. Monthly Spending & Seasonality Dataset Analyzed.")
    
    resume_skills = analyze_resume_skills()
    print("✓ 4. Resume / CV Skills Extraction Dataset Analyzed.")
    
    job_skills = analyze_job_skills()
    print("✓ 5. Job Skills (GitHub) Dataset Analyzed.")
    
    ai_job_prediction = analyze_ai_job_prediction()
    print("✓ 6. AI Resume Job Role Prediction Dataset Analyzed.")
    
    summary = {
        'generatedAt': '2026-09-11',
        'datasets': {
            'worldBankUnemployment': world_bank,
            'indianPersonalFinance': personal_finance,
            'monthlySpendingSeasonality': spending_time_series,
            'resumeSkillsExtraction': resume_skills,
            'jobSkillsRequirements': job_skills,
            'aiJobRolePrediction': ai_job_prediction
        }
    }
    
    out_path = os.path.join(DATA_DIR, 'analytics_summary.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)
        
    print(f"\nComprehensive Analytics Summary written to: {out_path}")
    print("=" * 60)

if __name__ == '__main__':
    main()
