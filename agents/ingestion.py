import pandas as pd
import json
import uuid
from typing import List, Union
from datetime import datetime
from core.schemas import Transaction
from core.utils import setup_logger

logger = setup_logger("ingestion_agent")

class IngestionAgent:
    """
    Agent 1: Ingestion & Normalization
    Responsibility: Parse raw transaction data and convert it into a standard format.
    """

    def ingest(self, file_path: str) -> List[Transaction]:
        """
        Ingests data from a file (CSV or JSON) and returns a list of normalized Transactions.
        """
        logger.info(f"Ingesting file: {file_path}")
        
        try:
            if file_path.endswith('.csv'):
                return self._ingest_csv(file_path)
            elif file_path.endswith('.json'):
                return self._ingest_json(file_path)
            else:
                raise ValueError("Unsupported file format. Please use CSV or JSON.")
        except Exception as e:
            logger.error(f"Error ingesting file: {e}")
            raise

    def _ingest_csv(self, file_path: str) -> List[Transaction]:
        df = pd.read_csv(file_path)
        transactions = []
        
        # Basic column mapping (can be enhanced with fuzzy matching or config)
        # Expected columns: date, amount, type, merchant, description
        # If columns are missing, we might need more robust logic.
        
        required_cols = ['date', 'amount', 'type', 'merchant', 'description']
        
        # Check if columns exist, if not try to map common variations
        df.columns = [c.lower().strip() for c in df.columns]
        
        for _, row in df.iterrows():
            txn = self._normalize_transaction(row)
            if txn:
                transactions.append(txn)
                
        return transactions

    def _ingest_json(self, file_path: str) -> List[Transaction]:
        with open(file_path, 'r') as f:
            data = json.load(f)
            
        if isinstance(data, dict) and 'transactions' in data:
            data = data['transactions']
            
        transactions = []
        for item in data:
            # Convert dict to something _normalize_transaction can handle (like a dict or series)
            txn = self._normalize_transaction(item)
            if txn:
                transactions.append(txn)
        return transactions

    def _normalize_transaction(self, row: Union[pd.Series, dict]) -> Transaction:
        """
        Normalizes a single raw transaction record.
        """
        try:
            # Generate ID if not present
            txn_id = str(row.get('id', uuid.uuid4()))
            
            # Date parsing
            raw_date = row.get('date')
            if isinstance(raw_date, str):
                # Try multiple formats
                try:
                    date_obj = pd.to_datetime(raw_date).date()
                except:
                    date_obj = datetime.now().date() # Fallback or error?
            else:
                date_obj = datetime.now().date()

            # Amount parsing
            raw_amount = row.get('amount', 0.0)
            try:
                amount = float(str(raw_amount).replace(',', '').replace('$', ''))
            except:
                amount = 0.0

            # Type parsing
            txn_type = str(row.get('type', 'expense')).lower()
            if txn_type not in ['income', 'expense']:
                # Infer from amount sign if possible?
                if amount < 0:
                    txn_type = 'expense'
                    amount = abs(amount)
                else:
                    txn_type = 'income' # Default to income if positive? Or expense?
                    # Let's assume expense if unknown for safety, or keep as is.
                    # For now, strict validation or default.
                    txn_type = 'expense'

            # Merchant cleaning
            merchant = str(row.get('merchant', 'Unknown')).strip()
            
            # Description cleaning
            description = str(row.get('description', '')).strip()
            if not description:
                description = merchant

            return Transaction(
                id=txn_id,
                txn_date=date_obj,
                amount=amount,
                txn_type=txn_type,
                merchant=merchant,
                description=description
            )
        except Exception as e:
            logger.warning(f"Skipping malformed transaction: {row} - Error: {e}")
            return None
