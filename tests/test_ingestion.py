import pytest
import os
from agents.ingestion import IngestionAgent
from core.schemas import Transaction

@pytest.fixture
def ingestion_agent():
    return IngestionAgent()

def test_ingest_csv(ingestion_agent):
    file_path = os.path.join("data", "sample_transactions.csv")
    # Ensure file exists or create it temporarily
    if not os.path.exists(file_path):
        pytest.skip("Sample CSV not found")
        
    transactions = ingestion_agent.ingest(file_path)
    assert len(transactions) == 4
    assert isinstance(transactions[0], Transaction)
    assert transactions[0].merchant == "Uber"
    assert transactions[0].amount == 50.0

def test_ingest_json(ingestion_agent):
    file_path = os.path.join("data", "sample_transactions.json")
    if not os.path.exists(file_path):
        pytest.skip("Sample JSON not found")
        
    transactions = ingestion_agent.ingest(file_path)
    assert len(transactions) == 2
    assert transactions[0].id == "t1"
    assert transactions[0].merchant == "Uber"

def test_normalization(ingestion_agent):
    raw_data = {
        "date": "2023-12-25",
        "amount": "$1,000.00",
        "type": "expense",
        "merchant": "  Best Buy  ",
        "description": "Gift"
    }
    txn = ingestion_agent._normalize_transaction(raw_data)
    assert txn.amount == 1000.0
    assert txn.merchant == "Best Buy"
    assert str(txn.txn_date) == "2023-12-25"
