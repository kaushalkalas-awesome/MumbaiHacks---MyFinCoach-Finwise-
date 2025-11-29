import pandas as pd
from typing import List, Dict
from datetime import datetime, timedelta
from collections import defaultdict
from core.schemas import Transaction, Insight, AnalysisResult
from core.utils import setup_logger

logger = setup_logger("analytics_agent")

class AnalyticsAgent:
    """
    Agent 3: Pattern Detection + Analytics
    Responsibility: Analyze transactions to detect patterns, leaks, and trends.
    """

    def analyze(self, transactions: List[Transaction]) -> AnalysisResult:
        """
        Performs comprehensive analysis on transactions.
        """
        logger.info(f"Analyzing {len(transactions)} transactions...")
        
        if not transactions:
            return AnalysisResult(
                insights=[],
                spending_by_category={},
                fixed_expenses_total=0.0,
                variable_expenses_total=0.0,
                total_income=0.0,
                total_expense=0.0
            )
        
        # Convert to DataFrame for easier analysis
        df = self._to_dataframe(transactions)
        
        # Calculate totals
        totals = self._calculate_totals(df)
        
        # Identify insights
        insights = []
        insights.extend(self._detect_spend_leaks(df))
        insights.extend(self._detect_weekend_overspending(df))
        insights.extend(self._detect_subscriptions(df))
        insights.extend(self._detect_category_spikes(df))
        insights.extend(self._detect_trends(df))
        
        return AnalysisResult(
            insights=insights,
            spending_by_category=totals['by_category'],
            fixed_expenses_total=totals['fixed'],
            variable_expenses_total=totals['variable'],
            total_income=totals['income'],
            total_expense=totals['expense']
        )

    def _to_dataframe(self, transactions: List[Transaction]) -> pd.DataFrame:
        """
        Converts transactions to a DataFrame.
        """
        data = []
        for txn in transactions:
            data.append({
                'id': txn.id,
                'date': txn.txn_date,
                'amount': txn.amount,
                'type': txn.txn_type,
                'merchant': txn.merchant,
                'description': txn.description,
                'category': txn.category or 'Uncategorized',
                'is_fixed': txn.is_fixed or False
            })
        return pd.DataFrame(data)

    def _calculate_totals(self, df: pd.DataFrame) -> Dict:
        """
        Calculates spending totals.
        """
        result = {
            'by_category': {},
            'fixed': 0.0,
            'variable': 0.0,
            'income': 0.0,
            'expense': 0.0
        }
        
        # Total income and expenses
        result['income'] = df[df['type'] == 'income']['amount'].sum()
        result['expense'] = df[df['type'] == 'expense']['amount'].sum()
        
        # By category
        expenses_df = df[df['type'] == 'expense']
        if not expenses_df.empty:
            by_cat = expenses_df.groupby('category')['amount'].sum().to_dict()
            result['by_category'] = by_cat
            
            # Fixed vs Variable
            result['fixed'] = expenses_df[expenses_df['is_fixed'] == True]['amount'].sum()
            result['variable'] = expenses_df[expenses_df['is_fixed'] == False]['amount'].sum()
        
        return result

    def _detect_spend_leaks(self, df: pd.DataFrame) -> List[Insight]:
        """
        Detects small recurring expenses that add up (spend leaks).
        """
        insights = []
        expenses_df = df[df['type'] == 'expense']
        
        # Group by merchant and count transactions < 500
        small_txns = expenses_df[expenses_df['amount'] < 500]
        merchant_counts = small_txns.groupby('merchant').agg({'amount': ['count', 'sum']})
        merchant_counts.columns = ['count', 'total']
        
        # If a merchant appears 3+ times with small amounts
        leaks = merchant_counts[merchant_counts['count'] >= 3]
        
        for merchant, row in leaks.iterrows():
            if row['total'] > 1000:  # Only flag if total > 1000
                insights.append(Insight(
                    insight_type="spend_leak",
                    description=f"Multiple small transactions at {merchant} totaling Rs.{row['total']:.2f} ({int(row['count'])} transactions)",
                    severity="medium",
                    related_transaction_ids=small_txns[small_txns['merchant'] == merchant]['id'].tolist()
                ))
        
        return insights

    def _detect_weekend_overspending(self, df: pd.DataFrame) -> List[Insight]:
        """
        Detects if user spends significantly more on weekends.
        """
        insights = []
        expenses_df = df[df['type'] == 'expense'].copy()
        
        if expenses_df.empty:
            return insights
        
        expenses_df['weekday'] = pd.to_datetime(expenses_df['date']).dt.dayofweek
        expenses_df['is_weekend'] = expenses_df['weekday'].isin([5, 6])
        
        weekend_spend = expenses_df[expenses_df['is_weekend']]['amount'].sum()
        weekday_spend = expenses_df[~expenses_df['is_weekend']]['amount'].sum()
        
        weekend_days = expenses_df[expenses_df['is_weekend']]['date'].nunique()
        weekday_days = expenses_df[~expenses_df['is_weekend']]['date'].nunique()
        
        if weekend_days > 0 and weekday_days > 0:
            avg_weekend = weekend_spend / weekend_days
            avg_weekday = weekday_spend / weekday_days
            
            if avg_weekend > avg_weekday * 1.5:  # 50% more on weekends
                insights.append(Insight(
                    insight_type="weekend_overspending",
                    description=f"Weekend spending (Rs.{avg_weekend:.2f}/day) is {((avg_weekend/avg_weekday - 1) * 100):.0f}% higher than weekdays (Rs.{avg_weekday:.2f}/day)",
                    severity="medium"
                ))
        
        return insights

    def _detect_subscriptions(self, df: pd.DataFrame) -> List[Insight]:
        """
        Detects recurring subscription-like payments.
        """
        insights = []
        expenses_df = df[df['type'] == 'expense']
        
        # Group by merchant
        for merchant, group in expenses_df.groupby('merchant'):
            if len(group) >= 2:
                amounts = group['amount'].values
                # Check if amounts are similar (within 10%)
                if len(set(amounts)) == 1 or (amounts.max() - amounts.min()) / amounts.mean() < 0.1:
                    total = amounts.sum()
                    insights.append(Insight(
                        insight_type="subscription",
                        description=f"Recurring payment to {merchant}: Rs.{amounts[0]:.2f} x {len(amounts)} = Rs.{total:.2f}",
                        severity="low",
                        related_transaction_ids=group['id'].tolist()
                    ))
        
        return insights

    def _detect_category_spikes(self, df: pd.DataFrame) -> List[Insight]:
        """
        Detects unusual spikes in category spending.
        """
        insights = []
        expenses_df = df[df['type'] == 'expense']
        
        if expenses_df.empty:
            return insights
        
        # Calculate average per category
        by_cat = expenses_df.groupby('category')['amount'].agg(['sum', 'mean', 'count'])
        
        # Flag categories with high total and high average (potential spikes)
        for category, row in by_cat.iterrows():
            if row['sum'] > 5000 and category not in ['Rent', 'Salary', 'Utilities']:
                insights.append(Insight(
                    insight_type="category_spike",
                    description=f"High spending in {category}: Rs.{row['sum']:.2f} across {int(row['count'])} transactions",
                    severity="medium"
                ))
        
        return insights

    def _detect_trends(self, df: pd.DataFrame) -> List[Insight]:
        """
        Detects month-over-month trends.
        """
        insights = []
        expenses_df = df[df['type'] == 'expense'].copy()
        
        if expenses_df.empty:
            return insights
        
        expenses_df['month'] = pd.to_datetime(expenses_df['date']).dt.to_period('M')
        monthly = expenses_df.groupby('month')['amount'].sum()
        
        if len(monthly) >= 2:
            # Compare first and last month
            first_month = monthly.iloc[0]
            last_month = monthly.iloc[-1]
            
            if last_month > first_month * 1.2:
                insights.append(Insight(
                    insight_type="trend_increasing",
                    description=f"Spending increased from Rs.{first_month:.2f} to Rs.{last_month:.2f} over time",
                    severity="high"
                ))
            elif last_month < first_month * 0.8:
                insights.append(Insight(
                    insight_type="trend_decreasing",
                    description=f"Spending decreased from Rs.{first_month:.2f} to Rs.{last_month:.2f} - great progress!",
                    severity="low"
                ))
        
        return insights
