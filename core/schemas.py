from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import date, datetime

class Transaction(BaseModel):
    """
    Represents a single financial transaction.
    """
    id: str = Field(..., description="Unique identifier for the transaction")
    txn_date: date = Field(..., description="Date of the transaction")
    amount: float = Field(..., description="Transaction amount")
    txn_type: Literal["income", "expense"] = Field(..., description="Type of transaction")
    merchant: str = Field(..., description="Name of the merchant")
    description: str = Field(..., description="Raw description of the transaction")
    category: Optional[str] = Field(None, description="Assigned category")
    is_fixed: Optional[bool] = Field(None, description="True if fixed expense, False if variable")
    confidence_score: float = Field(0.0, description="Confidence score for categorization")

class Category(BaseModel):
    """
    Represents a transaction category.
    """
    name: str
    cat_type: Literal["fixed", "variable", "income"]
    keywords: List[str] = []

class Insight(BaseModel):
    """
    Represents a behavioral insight derived from analysis.
    """
    insight_type: str = Field(..., description="Type of insight (e.g., 'spend_leak', 'trend')")
    description: str = Field(..., description="Human-readable description of the insight")
    severity: Literal["low", "medium", "high"] = Field("medium", description="Importance of the insight")
    related_transaction_ids: List[str] = Field(default_factory=list, description="IDs of transactions related to this insight")

class Recommendation(BaseModel):
    """
    Represents a financial recommendation/coaching tip.
    """
    title: str = Field(..., description="Short title of the recommendation")
    description: str = Field(..., description="Detailed explanation")
    actionable_steps: List[str] = Field(default_factory=list, description="Steps user can take")
    estimated_savings: Optional[float] = Field(None, description="Estimated monthly savings if followed")
    rationale: str = Field(..., description="Why this recommendation is made")

class AgentLog(BaseModel):
    """
    Log entry for agent actions.
    """
    agent_name: str
    timestamp: datetime = Field(default_factory=datetime.now)
    action: str
    details: str

class AnalysisResult(BaseModel):
    """
    Combined output from the Analytics Agent.
    """
    insights: List[Insight]
    spending_by_category: dict[str, float]
    fixed_expenses_total: float
    variable_expenses_total: float
    total_income: float
    total_expense: float
