import pytest
from agents.categorization import CategorizationAgent
from agents.ingestion import IngestionAgent
from core.schemas import Transaction
from datetime import date

@pytest.fixture
def categorization_agent():
    return CategorizationAgent()

def test_categorize_transport(categorization_agent):
    txn = Transaction(
        id="t1",
        txn_date=date(2023, 10, 1),
        amount=50.0,
        txn_type="expense",
        merchant="Uber",
        description="Ride to work"
    )
    categorization_agent._categorize_single(txn)
    assert txn.category == "Transport"
    assert txn.is_fixed == False
    assert txn.confidence_score > 0.5

def test_categorize_dining(categorization_agent):
    txn = Transaction(
        id="t2",
        txn_date=date(2023, 10, 2),
        amount=12.5,
        txn_type="expense",
        merchant="Starbucks",
        description="Coffee"
    )
    categorization_agent._categorize_single(txn)
    assert txn.category == "Dining Out"
    assert txn.is_fixed == False

def test_categorize_fixed_expense(categorization_agent):
    txn = Transaction(
        id="t3",
        txn_date=date(2023, 10, 5),
        amount=15000.0,
        txn_type="expense",
        merchant="Landlord",
        description="Monthly rent"
    )
    categorization_agent._categorize_single(txn)
    assert txn.category == "Rent"
    assert txn.is_fixed == True

def test_categorize_income(categorization_agent):
    txn = Transaction(
        id="t4",
        txn_date=date(2023, 10, 5),
        amount=50000.0,
        txn_type="income",
        merchant="Employer",
        description="Salary"
    )
    categorization_agent._categorize_single(txn)
    assert txn.category == "Salary"
    assert txn.txn_type == "income"

def test_categorize_uncategorized(categorization_agent):
    txn = Transaction(
        id="t5",
        txn_date=date(2023, 10, 10),
        amount=100.0,
        txn_type="expense",
        merchant="Unknown Merchant",
        description="Random purchase"
    )
    categorization_agent._categorize_single(txn)
    assert txn.category == "Uncategorized"
    assert txn.confidence_score == 0.0
