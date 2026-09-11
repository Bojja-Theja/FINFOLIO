"""
CAPSTACK ML Models - Advanced Machine Learning Models
Trained models for financial prediction and risk assessment
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

import numpy as np
from sklearn.ensemble import (  # type: ignore
    RandomForestRegressor,
    GradientBoostingClassifier,
)
from sklearn.preprocessing import StandardScaler  # type: ignore
import joblib

logger = logging.getLogger(__name__)

MODEL_DIR = Path("app/models")
MODEL_DIR.mkdir(exist_ok=True)


class FinancialRiskModel:
    """Enhanced Risk scoring model using advanced ensemble methods"""

    def __init__(self):
        # Use XGBoost for better performance
        try:
            from xgboost import XGBRegressor
            self.model = XGBRegressor(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1,
                objective='reg:squarederror',
                reg_alpha=0.1,
                reg_lambda=0.1
            )
        except ImportError:
            # Fallback to RandomForest if XGBoost not available
            self.model = RandomForestRegressor(
                n_estimators=200,
                max_depth=12,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
                max_features='sqrt'
            )
        self.scaler = StandardScaler()
        self.is_trained = False
        has_booster = hasattr(self.model, 'booster')
        model_type = "XGBoost" if has_booster else "RandomForest"
        self.metadata = {
            "version": "2.0.0",
            "created": datetime.utcnow().isoformat(),
            "accuracy_score": 0.0,
            "model_type": model_type,
            "features": [
                "income", "expenses", "savings", "debt",
                "debt_to_income", "savings_to_income", "expense_to_income"
            ]
        }

    def prepare_features(self, data: Dict[str, float]) -> np.ndarray:
        """Prepare input features for prediction"""
        features = [
            data.get("income", 0),
            data.get("expenses", 0),
            data.get("savings", 0),
            data.get("debt", 0),
            data.get("debt", 0) / max(data.get("income", 1), 1),
            data.get("savings", 0) / max(data.get("income", 1), 1),
            data.get("expenses", 0) / max(data.get("income", 1), 1)
        ]
        return np.array(features).reshape(1, -1)

    def predict(self, data: Dict[str, float]) -> float:
        """Predict risk score"""
        if not self.is_trained:
            return self._rule_based_risk(data)
        features = self.prepare_features(data)
        scaled = self.scaler.transform(features)
        score = self.model.predict(scaled)[0]
        return min(max(score, 0), 100)

    @staticmethod
    def _rule_based_risk(data: Dict[str, float]) -> float:
        """Fallback rule-based calculation"""
        income = data.get("income", 1)
        expense_ratio = data.get("expenses", 0) / income if income > 0 else 1
        savings_ratio = data.get("savings", 0) / income if income > 0 else 0
        debt_ratio = data.get("debt", 0) / income if income > 0 else 1

        risk = (
            (expense_ratio * 0.5) +
            ((1 - savings_ratio) * 0.3) +
            (debt_ratio * 0.2)
        ) * 100
        return min(max(risk, 0), 100)

    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the model"""
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        accuracy = self.model.score(X_scaled, y)
        self.metadata["accuracy_score"] = float(accuracy)
        logger.info("Risk model trained with accuracy: %.3f", accuracy)

    def save(self):
        """Save model to disk"""
        model_path = MODEL_DIR / "risk_model.pkl"
        scaler_path = MODEL_DIR / "risk_scaler.pkl"
        metadata_path = MODEL_DIR / "risk_metadata.json"

        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)
        logger.info("Risk model saved to %s", model_path)

    def load(self):
        """Load model from disk"""
        model_path = MODEL_DIR / "risk_model.pkl"
        scaler_path = MODEL_DIR / "risk_scaler.pkl"

        if model_path.exists() and scaler_path.exists():
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.is_trained = True
            logger.info("Risk model loaded successfully")
        else:
            logger.warning(
                "Risk model not found, using rule-based predictions"
            )


class LayoffRiskModel:
    """Layoff risk prediction using gradient boosting"""

    def __init__(self):
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.metadata = {
            "version": "1.0.0",
            "created": datetime.utcnow().isoformat(),
            "accuracy_score": 0.0
        }

    def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare input features"""
        industry_map = {
            "IT": 1,
            "Manufacturing": 2,
            "Retail": 3,
            "Finance": 4,
            "Healthcare": 5
        }

        features = [
            industry_map.get(data.get("industry", "IT"), 1),
            data.get("experience_years", 5),
            data.get("company_age", 10),
            data.get("team_size", 10),
            1 if data.get("contract_type") == "permanent" else 0,
            data.get("performance_rating", 3)
        ]
        return np.array(features).reshape(1, -1)

    def predict(self, data: Dict[str, Any]) -> float:
        """Predict layoff risk"""
        if not self.is_trained:
            return self._rule_based_risk(data)
        features = self.prepare_features(data)
        scaled = self.scaler.transform(features)
        prob = self.model.predict_proba(scaled)[0, 1]
        return float(prob)

    @staticmethod
    def _rule_based_risk(data: Dict[str, Any]) -> float:
        """Fallback rule-based calculation"""
        industry_risk = {
            "IT": 0.15,
            "Manufacturing": 0.25,
            "Retail": 0.35,
            "Finance": 0.20,
            "Healthcare": 0.10
        }
        industry = data.get("industry", "IT")
        base_risk = industry_risk.get(industry, 0.2)
        experience = max(1, data.get("experience_years", 1))
        experience_factor = max(0.5, experience / 10)
        risk = base_risk / experience_factor
        return min(risk, 0.9)

    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the model"""
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        accuracy = self.model.score(X_scaled, y)
        self.metadata["accuracy_score"] = float(accuracy)
        logger.info("Layoff risk model trained with accuracy: %.3f", accuracy)

    def save(self):
        """Save model to disk"""
        model_path = MODEL_DIR / "layoff_model.pkl"
        scaler_path = MODEL_DIR / "layoff_scaler.pkl"
        metadata_path = MODEL_DIR / "layoff_metadata.json"

        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)
        logger.info("Layoff model saved to %s", model_path)

    def load(self):
        """Load model from disk"""
        model_path = MODEL_DIR / "layoff_model.pkl"
        scaler_path = MODEL_DIR / "layoff_scaler.pkl"

        if model_path.exists() and scaler_path.exists():
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.is_trained = True
            logger.info("Layoff model loaded successfully")
        else:
            logger.warning(
                "Layoff model not found, using rule-based predictions"
            )


class SavingsProjectionModel:
    """Savings trajectory prediction"""

    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.metadata = {
            "version": "1.0.0",
            "created": datetime.utcnow().isoformat(),
            "r2_score": 0.0
        }

    def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare input features"""
        features = [
            data.get("current_savings", 0),
            data.get("monthly_savings", 0),
            data.get("expected_return", 7),
            data.get("inflation_rate", 3.5),
            data.get("months_to_project", 12),
            data.get("investment_type", 0)
        ]
        return np.array(features).reshape(1, -1)

    def predict(self, data: Dict[str, Any]) -> float:
        """Predict future savings"""
        if not self.is_trained:
            return self._calculate_projection(data)
        features = self.prepare_features(data)
        scaled = self.scaler.transform(features)
        value = self.model.predict(scaled)[0]
        return max(0, float(value))

    @staticmethod
    def _calculate_projection(data: Dict[str, Any]) -> float:
        """Fallback projection calculation using vectorized operations"""
        current = data.get("current_savings", 0)
        monthly = data.get("monthly_savings", 0)
        ret = data.get("expected_return", 7) / 100 / 12
        months = data.get("months_to_project", 12)

        if months <= 0:
            return current

        # Vectorized calculation for compound growth
        # Future value = current * (1+r)^n + monthly * ((1+r)^n - 1)/r
        if ret == 0:
            future = current + monthly * months
        else:
            growth_factor = (1 + ret) ** months
            monthly_component = monthly * (growth_factor - 1) / ret
            future = current * growth_factor + monthly_component

        return future

    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the model"""
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        r2_score = self.model.score(X_scaled, y)
        self.metadata["r2_score"] = float(r2_score)
        logger.info("Savings model trained with R² score: %.3f", r2_score)

    def save(self):
        """Save model to disk"""
        model_path = MODEL_DIR / "savings_model.pkl"
        scaler_path = MODEL_DIR / "savings_scaler.pkl"
        metadata_path = MODEL_DIR / "savings_metadata.json"

        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)
        logger.info("Savings model saved to %s", model_path)

    def load(self):
        """Load model from disk"""
        model_path = MODEL_DIR / "savings_model.pkl"
        scaler_path = MODEL_DIR / "savings_scaler.pkl"

        if model_path.exists() and scaler_path.exists():
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.is_trained = True
            logger.info("Savings model loaded successfully")
        else:
            logger.warning(
                "Savings model not found, using projection calculations"
            )


# Global model instances
risk_model = FinancialRiskModel()
layoff_model = LayoffRiskModel()
savings_model = SavingsProjectionModel()


def load_all_models():
    """Load all trained models"""
    risk_model.load()
    layoff_model.load()
    savings_model.load()
