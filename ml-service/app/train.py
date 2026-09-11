"""
CAPSTACK ML Model Training Pipeline
Generates synthetic training data and trains all ML models
"""

import logging
import sys
from pathlib import Path
from typing import Tuple

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Import models
from app.models import (
    FinancialRiskModel,
    LayoffRiskModel,
    SavingsProjectionModel
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def generate_risk_training_data(
    n_samples: int = 1000,
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate enhanced synthetic training data for risk model"""
    logger.info("Generating %d risk training samples...", n_samples)

    # Feature ranges with more realistic distributions
    incomes = np.random.lognormal(10, 0.3, n_samples)
    incomes = np.clip(incomes, 20000, 200000)

    # More sophisticated expense modeling
    base_expenses = np.random.uniform(0.4, 0.8, n_samples)
    discretionary = np.random.uniform(0.1, 0.4, n_samples)
    expenses_ratio = base_expenses + discretionary
    expenses = incomes * expenses_ratio

    # More realistic savings patterns
    savings_ratio = np.random.beta(2, 5, n_samples) * 0.6
    savings = incomes * savings_ratio

    # Debt modeling with different types
    debt_ratio = np.random.exponential(0.5, n_samples)
    debt_ratio = np.clip(debt_ratio, 0, 2.0)
    debt = incomes * debt_ratio

    # Additional derived features
    expense_to_income = expenses / np.maximum(incomes, 1)
    savings_to_income = savings / np.maximum(incomes, 1)
    debt_to_income = debt / np.maximum(incomes, 1)

    # New enhanced features
    disposable_income = incomes - expenses
    debt_service_ratio = np.where(incomes > 0, debt / incomes, 0)
    savings_buffer = np.where(expenses > 0, savings / expenses, 0)

    # Add some noise and outliers for robustness
    incomes = incomes * np.random.normal(1, 0.05, n_samples)
    expenses = expenses * np.random.normal(1, 0.03, n_samples)

    X = np.column_stack([
        incomes,
        expenses,
        savings,
        debt,
        debt_to_income,
        savings_to_income,
        expense_to_income,
        disposable_income,
        debt_service_ratio,
        savings_buffer
    ])

    # Generate risk scores based on enhanced formula
    y = (
        (expense_to_income * 0.4) +
        ((1 - savings_to_income) * 0.3) +
        (debt_to_income * 0.25) +
        (1 / (1 + savings_buffer) * 0.15) -
        (disposable_income / incomes * 0.1)
    ) * 100 + np.random.normal(0, 3, n_samples)
    y = np.clip(y, 0, 100)

    logger.info("Generated X shape: %s, y shape: %s", X.shape, y.shape)
    return X, y


def generate_layoff_training_data(
    n_samples: int = 1000,
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic training data for layoff risk model"""
    logger.info("Generating %d layoff training samples...", n_samples)

    # Industry risk (1-5, higher = riskier)
    industry = np.random.randint(1, 6, n_samples)
    # Experience in years
    experience = np.random.uniform(1, 30, n_samples)
    # Company age in years
    company_age = np.random.uniform(1, 50, n_samples)
    # Team size
    team_size = np.random.randint(1, 100, n_samples)
    # Contract type (0=contract, 1=permanent)
    contract = np.random.randint(0, 2, n_samples)
    # Performance rating (1-5)
    performance = np.random.uniform(1, 5, n_samples)

    X = np.column_stack([
        industry,
        experience,
        company_age,
        team_size,
        contract,
        performance
    ])

    # Generate labels: higher risk for lower experience, risky industry, etc.
    layoff_probability = (
        (industry * 0.1) -
        (experience * 0.02) -
        (company_age * 0.005) +
        (contract == 0) * 0.3 -
        (performance * 0.05)
    )
    y = (layoff_probability > 0.5).astype(int)

    logger.info("Generated X shape: %s, y shape: %s", X.shape, y.shape)
    return X, y


def generate_savings_training_data(
    n_samples: int = 1000,
) -> Tuple[np.ndarray, np.ndarray]:
    """Generate synthetic training data for savings projection model"""
    logger.info("Generating %d savings training samples...", n_samples)

    current_savings = np.random.uniform(0, 500000, n_samples)
    monthly_savings = np.random.uniform(0, 50000, n_samples)
    expected_return = np.random.uniform(2, 15, n_samples)
    inflation = np.random.uniform(1, 8, n_samples)
    months = np.random.randint(1, 36, n_samples)
    investment_type = np.random.randint(0, 5, n_samples)

    X = np.column_stack([
        current_savings,
        monthly_savings,
        expected_return,
        inflation,
        months,
        investment_type
    ])

    # Calculate future values
    y = np.zeros(n_samples)
    for i in range(n_samples):
        future = float(current_savings[i])
        monthly_ret = expected_return[i] / 100 / 12
        for _ in range(int(months[i])):
            future = (future + monthly_savings[i]) * (1 + monthly_ret)
        y[i] = future

    logger.info("Generated X shape: %s, y shape: %s", X.shape, y.shape)
    return X, y


def train_risk_model():
    """Train the risk model"""
    logger.info("=" * 80)
    logger.info("TRAINING FINANCIAL RISK MODEL")
    logger.info("=" * 80)

    X, y = generate_risk_training_data(n_samples=1000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42
    )

    model = FinancialRiskModel()
    model.train(X_train, y_train)

    # Evaluate
    y_pred = model.model.predict(model.scaler.transform(X_test))
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    logger.info("RMSE: %.2f", rmse)
    logger.info("R² Score: %.3f", r2)
    logger.info(
        "Test Accuracy (score): %.3f",
        model.model.score(model.scaler.transform(X_test), y_test),
    )

    model.save()
    logger.info("✓ Risk model trained and saved\n")


def train_layoff_model():
    """Train the layoff risk model"""
    logger.info("=" * 80)
    logger.info("TRAINING LAYOFF RISK MODEL")
    logger.info("=" * 80)

    X, y = generate_layoff_training_data(n_samples=1000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42
    )

    model = LayoffRiskModel()
    model.train(X_train, y_train)

    # Evaluate
    y_pred = model.model.predict(model.scaler.transform(X_test))
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    logger.info("Accuracy: %.3f", accuracy)
    logger.info("Precision: %.3f", precision)
    logger.info("Recall: %.3f", recall)
    logger.info("F1 Score: %.3f", f1)
    logger.info("Confusion Matrix:\n%s", cm)

    model.save()
    logger.info("✓ Layoff model trained and saved\n")


def train_savings_model():
    """Train the savings projection model"""
    logger.info("=" * 80)
    logger.info("TRAINING SAVINGS PROJECTION MODEL")
    logger.info("=" * 80)

    X, y = generate_savings_training_data(n_samples=1000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42
    )

    model = SavingsProjectionModel()
    model.train(X_train, y_train)

    # Evaluate
    y_pred = model.model.predict(model.scaler.transform(X_test))
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / np.maximum(np.abs(y_test), 1)))

    logger.info("RMSE: %.2f", rmse)
    logger.info("R² Score: %.3f", r2)
    logger.info("MAPE: %.3f", mape)

    model.save()
    logger.info("✓ Savings model trained and saved\n")


def main():
    """Main training pipeline"""
    logger.info("\n%s", "=" * 80)
    logger.info("CAPSTACK ML MODEL TRAINING PIPELINE")
    logger.info("\n%s", "=" * 80)

    try:
        # Create models directory
        Path("app/models").mkdir(parents=True, exist_ok=True)

        # Train all models
        train_risk_model()
        train_layoff_model()
        train_savings_model()

        logger.info("=" * 80)
        logger.info("✓ ALL MODELS TRAINED SUCCESSFULLY")
        logger.info("=" * 80)
        logger.info("\nModels saved in: app/models/")
        logger.info("Ready for deployment!")

    except Exception as e:
        logger.error("Training failed: %s", str(e), exc_info=True)
        raise


if __name__ == "__main__":
    main()
