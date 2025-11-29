from typing import List, Dict
from core.schemas import Transaction, Category
from core.utils import setup_logger

logger = setup_logger("categorization_agent")

class CategorizationAgent:
    """
    Agent 2: Categorization + Fixed/Variable Classification
    Responsibility: Assign categories and classify as fixed/variable.
    """

    def __init__(self):
        self.categories = self._load_categories()
        self.rules = self._load_rules()

    def _load_categories(self) -> Dict[str, Category]:
        """
        Defines the standard categories.
        """
        cats = [
            Category(name="Rent", cat_type="fixed", keywords=["rent", "landlord", "housing"]),
            Category(name="Groceries", cat_type="variable", keywords=["grocery", "supermarket", "mart", "food"]),
            Category(name="Dining Out", cat_type="variable", keywords=["restaurant", "cafe", "starbucks", "mcdonalds", "burger", "pizza", "swiggy", "zomato"]),
            Category(name="Transport", cat_type="variable", keywords=["uber", "ola", "taxi", "fuel", "petrol", "metro", "bus"]),
            Category(name="Utilities", cat_type="fixed", keywords=["electricity", "water", "gas", "internet", "wifi", "broadband", "mobile bill"]),
            Category(name="Salary", cat_type="income", keywords=["salary", "payroll", "employer"]),
            Category(name="Shopping", cat_type="variable", keywords=["amazon", "flipkart", "myntra", "clothing", "shoes"]),
            Category(name="Entertainment", cat_type="variable", keywords=["netflix", "spotify", "cinema", "movie", "bookmyshow"]),
            Category(name="Health", cat_type="variable", keywords=["pharmacy", "doctor", "hospital", "medplus"]),
            Category(name="Insurance", cat_type="fixed", keywords=["insurance", "lic", "premium"]),
            Category(name="Education", cat_type="fixed", keywords=["school", "college", "tuition", "course", "udemy"]),
        ]
        return {c.name: c for c in cats}

    def _load_rules(self) -> Dict[str, str]:
        """
        Maps keywords to category names.
        """
        rules = {}
        for cat_name, cat in self.categories.items():
            for keyword in cat.keywords:
                rules[keyword.lower()] = cat_name
        return rules

    def categorize(self, transactions: List[Transaction]) -> List[Transaction]:
        """
        Categorizes a list of transactions.
        """
        logger.info(f"Categorizing {len(transactions)} transactions...")
        
        for txn in transactions:
            self._categorize_single(txn)
            
        return transactions

    def _categorize_single(self, txn: Transaction):
        """
        Categorizes a single transaction.
        """
        text = (txn.merchant + " " + txn.description).lower()
        
        # Rule-based matching
        best_match = None
        
        # Simple keyword matching
        for keyword, cat_name in self.rules.items():
            if keyword in text:
                best_match = cat_name
                break # First match wins for now (can be improved)
        
        if best_match:
            cat = self.categories[best_match]
            txn.category = cat.name
            txn.is_fixed = (cat.cat_type == "fixed")
            txn.confidence_score = 0.9 # High confidence for keyword match
            
            # Special case for income
            if cat.cat_type == "income":
                txn.txn_type = "income"
                txn.is_fixed = False # Income isn't usually "fixed expense"
        else:
            txn.category = "Uncategorized"
            txn.is_fixed = False
            txn.confidence_score = 0.0
            
        # Fallback: If amount is exactly same as previous month's same merchant? (Not implemented yet)
