from typing import List
from core.schemas import Recommendation, AnalysisResult, Insight
from core.utils import setup_logger

logger = setup_logger("recommendation_agent")

class RecommendationAgent:
    """
    Agent 4: Financial Recommendation + Coaching
    Responsibility: Generate personalized saving and improvement advice.
    """

    def generate_recommendations(self, analysis: AnalysisResult, transactions: List = None) -> List[Recommendation]:
        """
        Generates personalized recommendations based on analytics.
        """
        logger.info("Generating recommendations...")
        
        recommendations = []
        
        # Detect income type (fixed vs variable)
        income_type = self._detect_income_type(transactions) if transactions else "unknown"
        logger.info(f"Detected income type: {income_type}")
        
        # Analyze insights and create recommendations
        for insight in analysis.insights:
            if insight.insight_type == "spend_leak":
                rec = self._recommend_for_spend_leak(insight, analysis, income_type)
                if rec:
                    recommendations.append(rec)
            
            elif insight.insight_type == "weekend_overspending":
                rec = self._recommend_for_weekend_overspending(insight, analysis, income_type)
                if rec:
                    recommendations.append(rec)
            
            elif insight.insight_type == "subscription":
                rec = self._recommend_for_subscription(insight, analysis, income_type)
                if rec:
                    recommendations.append(rec)
            
            elif insight.insight_type == "category_spike":
                rec = self._recommend_for_category_spike(insight, analysis, income_type)
                if rec:
                    recommendations.append(rec)
        
        # General recommendations based on totals and income type
        if analysis.total_expense > 0:
            # Savings rate recommendation (personalized by income type)
            savings_rate = (analysis.total_income - analysis.total_expense) / analysis.total_income if analysis.total_income > 0 else 0
            
            if savings_rate < 0.2:  # Less than 20% savings
                rec = self._recommend_savings_improvement(savings_rate, analysis, income_type)
                if rec:
                    recommendations.append(rec)
        
        # Check for immediate recent spending issues (Last 3 days)
        rec = self._recommend_immediate_action(transactions, analysis, income_type)
        if rec:
            recommendations.append(rec)

        # Sort recommendations by priority
        # Priority: Urgent > High Savings > Low Savings
        def get_priority(r):
            score = 0
            if "[URGENT]" in r.title: score += 1000
            score += r.estimated_savings if r.estimated_savings else 0
            return score

        recommendations.sort(key=get_priority, reverse=True)

        # Return all, but Orchestrator/UI will decide how many to show
        return recommendations

    def _recommend_immediate_action(self, transactions: List, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Analyzes the last 3 days of transactions to provide immediate, urgent advice.
        """
        if not transactions:
            return None
            
        # Find the "current" date (simulated as last transaction date)
        import pandas as pd
        from datetime import timedelta
        
        dates = [pd.to_datetime(t.txn_date) for t in transactions]
        last_date = max(dates)
        three_days_ago = last_date - timedelta(days=3)
        
        # Filter recent transactions
        recent_txns = [t for t in transactions if pd.to_datetime(t.txn_date) > three_days_ago and t.txn_type == "expense"]
        
        if not recent_txns:
            return None
            
        # Calculate recent spending
        recent_total = sum(t.amount for t in recent_txns)
        
        # Calculate daily average allowance (Income - Fixed Expenses) / 30
        disposable_income = analysis.total_income - analysis.fixed_expenses_total
        daily_budget = disposable_income / 30 if disposable_income > 0 else 0
        
        # If spent more than 3 days worth of budget in last 3 days (plus buffer)
        threshold = daily_budget * 3 * 1.5  # 1.5x buffer
        
        if recent_total > threshold and daily_budget > 0:
            # Identify top category in recent spending
            cat_totals = {}
            for t in recent_txns:
                cat_totals[t.category] = cat_totals.get(t.category, 0) + t.amount
            
            top_cat, top_amt = max(cat_totals.items(), key=lambda x: x[1])
            
            # Generate urgent recommendation
            excess = recent_total - (daily_budget * 3)
            
            title = f"[URGENT] Immediate Action: High Spending Alert ({top_cat})"
            
            description = f"""I've noticed a spike in your spending over the last 3 days. You've spent Rs.{recent_total:,.0f}, mainly on {top_cat} (Rs.{top_amt:,.0f}).
            
Based on your income, your 'safe' daily spending limit is around Rs.{daily_budget:,.0f}. You've exceeded this significantly recently."""
            
            if income_type == "variable":
                actionable_steps = [
                    f"URGENT: For the next 3 days, limit your total spending to Rs. 0 (Essentials only). No eating out, no shopping.",
                    f"TRANSFER NOW: Move Rs.{excess:,.0f} from your checking to savings immediately to 'pay back' this overspending.",
                    f"The 50/30/20 Rule Check: You've dipped into your 'Savings' bucket. We need to refill it.",
                    f"Next time you get a client payment, take out Rs.{excess:,.0f} FIRST before budgeting the rest."
                ]
                rationale = "As a freelancer, your cash flow is your lifeline. Overspending today steals from your safety net tomorrow. We need to correct this immediately to stay safe."
            else:
                actionable_steps = [
                    f"For the next 3 days, try a 'No Spend' challenge. Eat at home, free entertainment only.",
                    f"Check your bank balance. Do you have enough for upcoming fixed bills (Rent, EMI)?",
                    f"Set a daily reminder for the next week: 'Budget left: Rs.{daily_budget:,.0f}'",
                    f"Review the {top_cat} purchase. Was it planned? If not, return it if possible."
                ]
                rationale = "Getting back on track quickly is the key to financial health. A few days of strict budgeting now prevents a month of stress later."
                
            return Recommendation(
                title=title,
                description=description,
                actionable_steps=actionable_steps,
                estimated_savings=excess,
                rationale=rationale
            )
            
        return None


    def _detect_income_type(self, transactions) -> str:
        """
        Detects if user has fixed (salaried) or variable (freelance/business) income.
        
        Returns:
            "fixed" - Regular salaried income
            "variable" - Irregular/freelance income
            "unknown" - Cannot determine
        """
        if not transactions:
            return "unknown"
        
        # Filter income transactions
        income_txns = [t for t in transactions if t.txn_type == "income"]
        
        if len(income_txns) < 2:
            return "unknown"
        
        # Check for regularity in amounts
        amounts = [t.amount for t in income_txns]
        unique_amounts = set(amounts)
        
        # If all income amounts are same or very similar (within 10% variance)
        if len(unique_amounts) <= 2:
            amount_variance = (max(amounts) - min(amounts)) / (sum(amounts) / len(amounts)) if amounts else 0
            
            if amount_variance < 0.1:  # Less than 10% variance
                return "fixed"
        
        # Check for regular monthly income pattern
        from collections import Counter
        import pandas as pd
        
        dates = [pd.to_datetime(t.txn_date) for t in income_txns]
        monthly_counts = Counter([d.to_period('M') for d in dates])
        
        # If consistent monthly income (1-2 transactions per month)
        if all(1 <= count <= 2 for count in monthly_counts.values()):
            return "fixed"
        
        # Otherwise assume variable income
        return "variable"

    def _recommend_savings_improvement(self, savings_rate: float, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Generate highly personalized savings improvement recommendation based on income type.
        Uses conversational tone and specific examples from user's spending.
        """
        # Get actual spending breakdown
        spending_breakdown = self._create_spending_breakdown(analysis)
        
        # Calculate 50/30/20 amounts
        income = analysis.total_income
        needs_budget = income * 0.5
        wants_budget = income * 0.3
        savings_budget = income * 0.2
        
        if income_type == "fixed":
            # Salaried employee - detailed, conversational advice
            title = "Let's Build Your Savings Together (You Have a Steady Salary!)"
            
            description = f"""I see you're saving {savings_rate*100:.1f}% right now. Here's the thing - with your regular monthly income of Rs.{income:,.0f}, you have a huge advantage: predictability! Let's use that to automatically grow your wealth.

Here's what I noticed about your spending:
{spending_breakdown}

The goal? Get to at least 20% savings (that's Rs.{savings_budget:,.0f}/month). But let's be realistic - we'll do this step by step."""
            
            actionable_steps = [
                f"DAY 1: Set up auto-transfer of Rs.{income * 0.05:,.0f} (just 5%!) to savings on salary day. You won't even miss it.",
                
                f"THE 50/30/20 CHECK: Here is what your budget SHOULD look like:",
                f"   - NEEDS (50% = Rs.{needs_budget:,.0f}): Rent, Groceries, Utilities, EMI. (You spent Rs.{analysis.fixed_expenses_total:,.0f})",
                f"   - WANTS (30% = Rs.{wants_budget:,.0f}): Dining, Shopping, Netflix. (You spent Rs.{analysis.variable_expenses_total:,.0f})",
                f"   - SAVINGS (20% = Rs.{savings_budget:,.0f}): SIPs, Emergency Fund.",
                
                f"WEEK 1: Review your 'Wants'. Can you cut Rs.{analysis.variable_expenses_total * 0.1:,.0f} from {self._get_top_variable_categories(analysis)}?",
                
                "MONTH 2: Increase auto-transfer by 2%. Keep doing this until you hit 20%.",
                
                f"START A SIP: Even Rs. 1,000/month in a mutual fund SIP compounds to lakhs over 10 years."
            ]
            
            rationale = """Listen, I know it's tempting to spend when you get that salary. But here's what successful savers do: they pay themselves FIRST (that auto-transfer), then spend what's left. Your future self will thank you - whether it's for emergencies, a house down payment, or just peace of mind."""
            
            estimated_savings = (0.2 - savings_rate) * income if income > 0 else 0
            
        elif income_type == "variable":
            # Freelancer/gig worker - practical, buffer-focused advice
            title = "Building Your Safety Net (Freelancer Edition!)"
            
            # Calculate average and volatility
            income_avg = analysis.total_income
            
            description = f"""Okay, fellow freelancer! I see your income isn't fixed, which means you need a different game plan. Right now you're saving {savings_rate*100:.1f}%, but here's the scary truth: one slow month could wipe that out.

Your current situation:
- Income this period: Rs.{income:,.0f}
- Expenses: Rs.{analysis.total_expense:,.0f}
{spending_breakdown}

Here's what you NEED: a 6-month emergency fund. Why? Because your income varies. Some months you'll earn double, some months maybe nothing. The fund smooths out the bumps."""
            
            actionable_steps = [
                f"IMMEDIATELY: Put 40% of EVERY payment into a separate 'safety account'. That's Rs.{income_avg * 0.4:,.0f} from your current income. Treat it like it doesn't exist.",
                
                f"CALCULATE YOUR 'SURVIVAL NUMBER': Your fixed costs (rent, utilities, etc.) are Rs.{analysis.fixed_expenses_total:,.0f}/month. You need 6x that = Rs.{analysis.fixed_expenses_total * 6:,.0f} in emergency fund. This is your goal.",
                
                "LIVE ON YOUR WORST MONTH: Look at your lowest-earning month ever. Budget as if that's your income EVERY month. Everything above that? Straight to savings.",
                
                f"VARIABLE EXPENSES ({self._get_top_variable_categories(analysis)}): These are your 'flex' categories - Rs.{analysis.variable_expenses_total:,.0f}/month. Cut these FIRST in slow months.",
                
                "GOOD MONTH? Bank it. Don't increase lifestyle. Your bad months will come - be ready."
            ]
            
            rationale = """Look, I've seen too many freelancers live like they earn their best month every month. Then one dry spell and they're scrambling. You're smarter than that. Build that buffer NOW while money is coming in. Think of it as paying your future self a salary during lean times."""
            
            estimated_savings = (0.35 - savings_rate) * income if income > 0 else 0
            
        else:
            # Unknown income type - still make it friendly
            title = "Let's Get Your Money Working For You"
            
            description = f"""Currently saving {savings_rate*100:.1f}% of income. Financial experts recommend 20% minimum, but let me break down what that actually means for YOU:

{spending_breakdown}"""
            
            actionable_steps = [
                "Automate it: Set up auto-transfer of 10% to savings right after income comes in",
                f"Your variable expenses (Rs.{analysis.variable_expenses_total:,.0f}): Find Rs.{analysis.variable_expenses_total * 0.1:,.0f} to cut", 
                f"THE 50/30/20 RULE: Aim for Needs Rs.{needs_budget:,.0f}, Wants Rs.{wants_budget:,.0f}, Savings Rs.{savings_budget:,.0f}."
            ]
            
            rationale = "Small changes now = big results later. Start with 10%, increase gradually."
            estimated_savings = (0.2 - savings_rate) * income if income > 0 else 0
            
        return Recommendation(
            title=title,
            description=description,
            actionable_steps=actionable_steps,
            estimated_savings=estimated_savings,
            rationale=rationale
        )
    
    def _create_spending_breakdown(self, analysis: AnalysisResult) -> str:
        """Creates a personalized spending breakdown in plain language."""
        breakdown = []
        
        # Fixed expenses
        if analysis.fixed_expenses_total > 0:
            fixed_pct = (analysis.fixed_expenses_total / analysis.total_expense * 100) if analysis.total_expense > 0 else 0
            breakdown.append(f"- Fixed costs (rent, utilities, etc.): Rs.{analysis.fixed_expenses_total:,.0f} ({fixed_pct:.0f}% of spending)")
        
        # Variable expenses with top categories
        if analysis.variable_expenses_total > 0:
            var_pct = (analysis.variable_expenses_total / analysis.total_expense * 100) if analysis.total_expense > 0 else 0
            breakdown.append(f"- Variable spending (food, shopping, etc.): Rs.{analysis.variable_expenses_total:,.0f} ({var_pct:.0f}% of spending)")
        
        # Top spending category
        if analysis.spending_by_category:
            top_cat, top_amt = max(analysis.spending_by_category.items(), key=lambda x: x[1])
            if top_cat not in ['Rent', 'Salary']:
                breakdown.append(f"- Your biggest expense? {top_cat} at Rs.{top_amt:,.0f}")
        
        return "\n".join(breakdown) if breakdown else "- Analyzing your spending patterns..."
    
    def _get_top_variable_categories(self, analysis: AnalysisResult) -> str:
        """Returns top 3 variable spending categories as comma-separated string."""
        if not analysis.spending_by_category:
            return "dining, shopping, entertainment"
        
        # Exclude fixed categories
        fixed_cats = ['Rent', 'Utilities', 'Insurance', 'Education']
        variable = {k: v for k, v in analysis.spending_by_category.items() if k not in fixed_cats}
        
        if not variable:
            return "dining, shopping, entertainment"
        
        top_3 = sorted(variable.items(), key=lambda x: x[1], reverse=True)[:3]
        return ", ".join([cat.lower() for cat, _ in top_3])
        
        # Limit to top 3 recommendations
        return recommendations[:3]

    def _detect_income_type(self, transactions) -> str:
        """
        Detects if user has fixed (salaried) or variable (freelance/business) income.
        
        Returns:
            "fixed" - Regular salaried income
            "variable" - Irregular/freelance income
            "unknown" - Cannot determine
        """
        if not transactions:
            return "unknown"
        
        # Filter income transactions
        income_txns = [t for t in transactions if t.txn_type == "income"]
        
        if len(income_txns) < 2:
            return "unknown"
        
        # Check for regularity in amounts
        amounts = [t.amount for t in income_txns]
        unique_amounts = set(amounts)
        
        # If all income amounts are same or very similar (within 10% variance)
        if len(unique_amounts) <= 2:
            amount_variance = (max(amounts) - min(amounts)) / (sum(amounts) / len(amounts)) if amounts else 0
            
            if amount_variance < 0.1:  # Less than 10% variance
                return "fixed"
        
        # Check for regular monthly income pattern
        from collections import Counter
        import pandas as pd
        
        dates = [pd.to_datetime(t.txn_date) for t in income_txns]
        monthly_counts = Counter([d.to_period('M') for d in dates])
        
        # If consistent monthly income (1-2 transactions per month)
        if all(1 <= count <= 2 for count in monthly_counts.values()):
            return "fixed"
        
        # Otherwise assume variable income
        return "variable"

    def _recommend_savings_improvement(self, savings_rate: float, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Generate highly personalized savings improvement recommendation based on income type.
        Uses conversational tone and specific examples from user's spending.
        """
        # Get actual spending breakdown
        spending_breakdown = self._create_spending_breakdown(analysis)
        
        if income_type == "fixed":
            # Salaried employee - detailed, conversational advice
            title = "Let's Build Your Savings Together (You Have a Steady Salary!)"
            
            description = f"""I see you're saving {savings_rate*100:.1f}% right now. Here's the thing - with your regular monthly income of Rs.{analysis.total_income:,.0f}, you have a huge advantage: predictability! Let's use that to automatically grow your wealth.

Here's what I noticed about your spending:
{spending_breakdown}

The goal? Get to at least 20% savings (that's Rs.{analysis.total_income * 0.2:,.0f}/month). But let's be realistic - we'll do this step by step."""
            
            actionable_steps = [
                f"DAY 1: Set up auto-transfer of Rs.{analysis.total_income * 0.05:,.0f} (just 5%!) to savings on salary day. You won't even miss it.",
                
                f"WEEK 1: Review your variable expenses (Rs.{analysis.variable_expenses_total:,.0f}). That's categories like {self._get_top_variable_categories(analysis)}. Can you cut 10% here? That's Rs.{analysis.variable_expenses_total * 0.1:,.0f}.",
                
                f"MONTH 2: Increase auto-transfer by 2% (Rs.{income * 0.02:,.0f}). Keep doing this until you hit 20%.",
                
                "START A SIP: Even Rs. 1,000/month in a mutual fund SIP compounds to lakhs over 10 years. With your steady income, this is your wealth-building superpower.",
                
                "Track it: Use any app to see your savings % each month. Celebrate when you hit milestones!"
            ]
            
            rationale = """Listen, I know it's tempting to spend when you get that salary. But here's what successful savers do: they pay themselves FIRST (that auto-transfer), then spend what's left. Your future self will thank you - whether it's for emergencies, a house down payment, or just peace of mind."""
            
            estimated_savings = (0.2 - savings_rate) * analysis.total_income if analysis.total_income > 0 else 0
            
        elif income_type == "variable":
            # Freelancer/gig worker - practical, buffer-focused advice
            title = "Building Your Safety Net (Freelancer Edition!)"
            
            # Calculate average and volatility
            income_avg = analysis.total_income
            
            description = f"""Okay, fellow freelancer! I see your income isn't fixed, which means you need a different game plan. Right now you're saving {savings_rate*100:.1f}%, but here's the scary truth: one slow month could wipe that out.

Your current situation:
- Income this period: Rs.{analysis.total_income:,.0f}
- Expenses: Rs.{analysis.total_expense:,.0f}
{spending_breakdown}

Here's what you NEED: a 6-month emergency fund. Why? Because your income varies. Some months you'll earn double, some months maybe nothing. The fund smooths out the bumps."""
            
            actionable_steps = [
                f"IMMEDIATELY: Put 40% of EVERY payment into a separate 'safety account'. That's Rs.{income_avg * 0.4:,.0f} from your current income. Treat it like it doesn't exist.",
                
                f"CALCULATE YOUR 'SURVIVAL NUMBER': Your fixed costs (rent, utilities, etc.) are Rs.{analysis.fixed_expenses_total:,.0f}/month. You need 6x that = Rs.{analysis.fixed_expenses_total * 6:,.0f} in emergency fund. This is your goal.",
                
                "LIVE ON YOUR WORST MONTH: Look at your lowest-earning month ever. Budget as if that's your income EVERY month. Everything above that? Straight to savings.",
                
                f"VARIABLE EXPENSES ({self._get_top_variable_categories(analysis)}): These are your 'flex' categories - Rs.{analysis.variable_expenses_total:,.0f}/month. Cut these FIRST in slow months.",
                
                "GOOD MONTH? Bank it. Don't increase lifestyle. Your bad months will come - be ready."
            ]
            
            rationale = """Look, I've seen too many freelancers live like they earn their best month every month. Then one dry spell and they're scrambling. You're smarter than that. Build that buffer NOW while money is coming in. Think of it as paying your future self a salary during lean times."""
            
            estimated_savings = (0.35 - savings_rate) * analysis.total_income if analysis.total_income > 0 else 0
            
        else:
            # Unknown income type - still make it friendly
            title = "Let's Get Your Money Working For You"
            
            description = f"""Currently saving {savings_rate*100:.1f}% of income. Financial experts recommend 20% minimum, but let me break down what that actually means for YOU:

{spending_breakdown}"""
            
            actionable_steps = [
                "Automate it: Set up auto-transfer of 10% to savings right after income comes in",
                f"Your variable expenses (Rs.{analysis.variable_expenses_total:,.0f}): Find Rs.{analysis.variable_expenses_total * 0.1:,.0f} to cut", 
                f"THE 50/30/20 RULE: Aim for Needs Rs.{analysis.total_income * 0.5:,.0f}, Wants Rs.{analysis.total_income * 0.3:,.0f}, Savings Rs.{analysis.total_income * 0.2:,.0f}."
            ]
            
            rationale = "Small changes now = big results later. Start with 10%, increase gradually."
            estimated_savings = (0.2 - savings_rate) * analysis.total_income if analysis.total_income > 0 else 0
            
        return Recommendation(
            title=title,
            description=description,
            actionable_steps=actionable_steps,
            estimated_savings=estimated_savings,
            rationale=rationale
        )
    
    def _create_spending_breakdown(self, analysis: AnalysisResult) -> str:
        """Creates a personalized spending breakdown in plain language."""
        breakdown = []
        
        # Fixed expenses
        if analysis.fixed_expenses_total > 0:
            fixed_pct = (analysis.fixed_expenses_total / analysis.total_expense * 100) if analysis.total_expense > 0 else 0
            breakdown.append(f"- Fixed costs (rent, utilities, etc.): Rs.{analysis.fixed_expenses_total:,.0f} ({fixed_pct:.0f}% of spending)")
        
        # Variable expenses with top categories
        if analysis.variable_expenses_total > 0:
            var_pct = (analysis.variable_expenses_total / analysis.total_expense * 100) if analysis.total_expense > 0 else 0
            breakdown.append(f"- Variable spending (food, shopping, etc.): Rs.{analysis.variable_expenses_total:,.0f} ({var_pct:.0f}% of spending)")
        
        # Top spending category
        if analysis.spending_by_category:
            top_cat, top_amt = max(analysis.spending_by_category.items(), key=lambda x: x[1])
            if top_cat not in ['Rent', 'Salary']:
                breakdown.append(f"- Your biggest expense? {top_cat} at Rs.{top_amt:,.0f}")
        
        return "\n".join(breakdown) if breakdown else "- Analyzing your spending patterns..."
    
    def _get_top_variable_categories(self, analysis: AnalysisResult) -> str:
        """Returns top 3 variable spending categories as comma-separated string."""
        if not analysis.spending_by_category:
            return "dining, shopping, entertainment"
        
        # Exclude fixed categories
        fixed_cats = ['Rent', 'Utilities', 'Insurance', 'Education']
        variable = {k: v for k, v in analysis.spending_by_category.items() if k not in fixed_cats}
        
        if not variable:
            return "dining, shopping, entertainment"
        
        top_3 = sorted(variable.items(), key=lambda x: x[1], reverse=True)[:3]
        return ", ".join([cat.lower() for cat, _ in top_3])
        

    def _recommend_for_spend_leak(self, insight: Insight, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Create highly personalized recommendation for spend leaks.
        """
        # Extract merchant and amount from description
        import re
        match_amt = re.search(r'Rs\.([\ d,]+\.?\d*)', insight.description)
        match_merchant = re.search(r'at (.+?) total', insight.description)
        
        amount = float(match_amt.group(1).replace(',', '')) if match_amt else 0
        merchant = match_merchant.group(1) if match_merchant else "this merchant"
        
        # Make it super practical and conversational
        title = f"Hey, Let's Talk About Those {merchant} Visits..."
        
        description = f"""I noticed something: you've been to {merchant} quite a few times, and it's added up to Rs.{amount:,.0f}. 

Now, I'm not saying stop completely - life's too short! But here's the math: if you cut this by just HALF, that's Rs.{amount * 0.5:,.0f} back in your pocket this month. Over a year? Rs.{amount * 0.5 * 12:,.0f}!

Think about what you could do with that money instead."""

        # Practical, day-by-day advice
        if "coffee" in merchant.lower() or "starbucks" in merchant.lower():
            actionable_steps = [
                f"WEEK 1: Try making coffee at home 3 days this week. Get good beans (Rs. 500) - still cheaper than {merchant}.",
                
                f"WEEK 2: Challenge yourself - can you go from daily {merchant} to just 2x per week? That's Rs.{amount * 0.7:,.0f} saved!",
                
                "MAKE IT FUN: Put the money you would've spent into a jar. Watch it grow. Use it for something awesome",
                
                f"ALTERNATIVES: A good thermos + home-brewed coffee costs maybe Rs. 15/cup VS Rs. {amount/14:.0f}/cup at {merchant}",
                
                "BE REALISTIC: If you LOVE your morning coffee out, keep it! But maybe skip the afternoon one?"
            ]
        else:
            actionable_steps = [
                f"STEP 1: Set a weekly budget: Rs. {amount/4:.0f} max at {merchant} per week. Use cash only - when it's gone, it's gone.",
                
                "STEP 2: Before each purchase, ask: 'Do I need this NOW, or do I just want it?'. Wait 10 minutes. Often the urge passes.",
                
                f"STEP 3: Find a cheaper alternative or do it yourself. Can you get the same thing for 30% less (Rs.{amount * 0.3:,.0f}) somewhere else?",
                
                f"STEP 4: Track it in your phone's notes. Every time you skip a purchase, note the money 'saved'. Watch it add up!",
                
                "STEP 5: Reward yourself! When you cut spending here, put it toward something you REALLY want."
            ]
        
        rationale = f"""Here's the thing about small recurring expenses - they're sneaky. One {merchant} visit feels harmless, but 10-15 visits? That's real money. You worked hard for that income. Make it count for things you'll actually remember a month from now."""
        
        return Recommendation(
            title=title,
            description=description,
            actionable_steps=actionable_steps,
            estimated_savings=amount * 0.5,
            rationale=rationale
        )

    def _recommend_for_weekend_overspending(self, insight: Insight, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Create practical recommendation for weekend overspending.
        """
        # Extract amounts from insight
        import re
        amounts = re.findall(r'Rs\.(\d+\.?\d*)', insight.description)
        weekend_avg = float(amounts[0]) if amounts else 0
        weekday_avg = float(amounts[1]) if len(amounts) > 1 else 0
        
        diff = weekend_avg - weekday_avg
        monthly_overspend = diff * 8  # Roughly 8 weekend days per month
        
        title = "Your Weekends Are Expensive (But We Can Fix This!)"
        
        description = f"""I've got some news: your weekends are costing you Rs.{weekend_avg:,.0f} per day vs weekdays at Rs.{weekday_avg:,.0f}. That's {((weekend_avg/weekday_avg - 1) * 100):.0f}% more!

Look, weekends should be fun. You've earned it after a week of work! But spending Rs.{monthly_overspend:,.0f} extra EVERY month on weekends? That's Rs.{monthly_overspend * 12:,.0f} per year!

Here's what's probably happening: Friday comes, you're tired, you say "I deserve this!" and boom - dining out, shopping, entertainment. Sound familiar?"""

        if income_type == "variable":
            # For freelancers - tie to income directly
            actionable_steps = [
                f"FRIDAY RULE: Had a good income week? Okay to spend Rs.{weekend_avg * 0.7:,.0f} this weekend. Slow week? Weekend budget is Rs.{weekday_avg:,.0f} max.",
                
                "PLAN FRIDAY MORNING (not Friday evening when tired): Decide what you'll do this weekend and budget for it. Stick to the plan.",
                
                "CASH ENVELOPE: Put your weekend budget in cash. When it's gone, switch to free activities (park, home movie night, cook together).",
                
                f"FREE WEEKENDS: Try 1-2 'free weekends' per month. Parks, hiking, game nights, cooking. You'll be surprised how fun they are AND you save Rs.{weekend_avg * 2:,.0f}!",
                
                "TRACK IT: Sunday night, add up weekend spending. If under budget, put the difference in savings. Make it a game!"
            ]
        else:
            # For salaried - standard advice
            actionable_steps = [
                f"THE BUDGET: Allocate Rs.{weekend_avg * 0.6:,.0f} for BOTH weekend days. Period. Anything more comes from your variable expense budget.",
                
                "THURSDAY NIGHT: Plan your weekend activities WITH budgets. 'Dinner out - Rs. 1,500 max. Movies - Rs. 800.' Specific numbers!",
                
                "SATURDAY MORNING: Withdraw weekend cash. Leave cards at home. Seriously - this works!",
                
                "ALTERNATIVES: Can you do brunch at home before going out? Movie at home instead of theater? Beach instead of mall?",
                
                f"ONE SPLURGE: Every 2 weekends, have ONE planned splurge (Rs.{weekend_avg:,.0f}). Other weekends, low-cost fun."
            ]
        
        rationale = """Weekend overspending is SO common. We work hard all week and feel we 'deserve' to spend. But here's the truth: your future self deserves financial security more than your present self deserves that expensive brunch. Find balance - fun weekends that don't wreck your finances."""
        
        return Recommendation(
            title=title,
            description=description,
            actionable_steps=actionable_steps,
            estimated_savings=monthly_overspend * 0.5,
            rationale=rationale
        )

    def _recommend_for_subscription(self, insight: Insight, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Create practical recommendation for subscriptions.
        """
        import re
        match = re.search(r'to (.+?): Rs\.([\ d,]+\.?\d*)', insight.description)
        merchant = match.group(1) if match else "this service"
        amount_str = match.group(2) if match else "0"
        amount = float(amount_str.replace(',', ''))
        
        # Count transactions from insight to get frequency
        match_count = re.search(r'× (\d+)', insight.description)
        count = int(match_count.group(1)) if match_count else 2
        
        title = f"Quick Question: Still Using {merchant}?"
        
        description = f"""I see you're paying Rs.{amount:,.0f} for {merchant}. You've paid this {count} times already.

Here's a question most people never ask: when was the last time you ACTUALLY used {merchant}? 

I'm not judging - I've had Netflix subscriptions I forgot about for months! But here's the math: Rs.{amount:,.0f}/month × 12 months = Rs.{amount * 12:,.0f} per year. For something you might not even use."""

        actionable_steps = [
            f"RIGHT NOW: Open {merchant}. When did you last use it? Be honest.",
            
            "THE 30-DAY TEST: Cancel it for one month. If you don't miss it, keep it cancelled. If you do, reactivate. Simple!",
            
            f"ANNUAL PLANS: If you use {merchant} regularly, check if annual plans are cheaper. Often saves 20-30%.",
            
            f"ALTERNATIVES: Can you get the same thing free? Libraries, YouTube, free apps, friends' accounts (within terms of service)?",
            
            f"THE AUDIT: List ALL your subscriptions. Add them up. Then ask: which 3 do I actually use? Cancel the rest. Easy Rs.{amount * 0.5:,.0f}+ saved!"
        ]
        
        rationale = f"""Subscriptions are designed to be 'set and forget' - that's how they make money! You're supposed to forget you're paying. Don't let them win. Every Rs. {amount:,.0f} you save here is money YOU control, not some company's recurring revenue."""
        
        return Recommendation(
            title=title,
            description=description,
            actionable_steps=actionable_steps,
            estimated_savings=amount,
            rationale=rationale
        )

    def _recommend_for_category_spike(self, insight: Insight, analysis: AnalysisResult, income_type: str) -> Recommendation:
        """
        Create practical recommendation for category spikes.
        """
        import re
        match = re.search(r'High spending in (\w+): Rs\.([\ d,]+\.?\d*) across (\d+)', insight.description)
        category = match.group(1) if match else "this category"
        amount = float(match.group(2).replace(',', '')) if match else 0
        txn_count = int(match.group(3)) if match and match.group(3) else 0
        
        avg_per_txn = amount / txn_count if txn_count > 0 else amount
       
        title = f"Whoa - Rs.{amount:,.0f} on {category}?!"
        
        description = f"""Okay, let's talk about {category}. You spent Rs.{amount:,.0f} across {txn_count} transactions. That averages Rs.{avg_per_txn:,.0f} each time!

I'm not saying {category} is bad - we all need things. But this is a LOT for one category. Let me put it in perspective: if you cut this by just 20%, that's Rs.{amount * 0.2:,.0f} saved. What could you do with that extra money?"""

        # Category-specific advice
        if category.lower() in ['shopping', 'amazon', 'flipkart', 'myntra']:
            actionable_steps = [
                "THE 48-HOUR RULE: Before buying ANYTHING non-essential, wait 48 hours. Add to cart, close tab, come back 2 days later. 70% of the time, you won't want it anymore.",
                
                f"SET A LIMIT: Max Rs.{amount * 0.5:,.0f} on shopping this month. When you hit the limit, STOP. No exceptions.",
                
                "DELETE THE APPS: Seriously. Remove Amazon/Flipkart from your phone for a month. Makes impulse buying way harder.",
                
                "NEED VS WANT: Before checkout, ask: 'Will I use this 10+ times in the next month?' If no, you don't need it.",
                
                f"SHOPPING FUND: If you love shopping, that's okay! But save for it. Put Rs.{avg_per_txn:,.0f} aside each month. Shop only with that fund."
            ]
        elif category.lower() in ['dining', 'zomato', 'swiggy', 'restaurant']:
            actionable_steps = [
                f"HOME COOKING CHALLENGE: Cook at home 4 days this week. Even simple dal-rice saves Rs.{avg_per_txn * 0.7:,.0f} per meal VS ordering.",
                
                f"MEAL PREP SUNDAY: Spend 2 hours cooking on Sunday. Make 4-5 meals. Saves Rs.{avg_per_txn * 4:,.0f} in delivery fees alone!",
                
                f"DINING OUT BUDGET: Rs.{amount * 0.4:,.0f}/month for eating out. Use it wisely - quality over quantity.",
                
                "DELIVERY FEE TRAP: That Rs. 50 delivery + Rs. 30 surge + Rs. 40 tax  = Rs. 120 extra PER ORDER! Cook or pick up.",
                
                "ONE RULE: Order out max 2x per week. Other days, cook or eat leftovers. Save Rs.{avg_per_txn * 2:,.0f}+ weekly!"
            ]
        else:
            actionable_steps = [
                f"BUDGET IT: {category} gets max Rs.{amount * 0.6:,.0f} next month. Track every rupee in this category.",
                
                "COMPARE PRICES: Before buying, check 3 places/websites. Often 20-30% price difference for same item!",
                
                "BULK BUYING: Can you buy in bulk quarterly instead of monthly? Usually saves 15-20%.",
                
                f"QUESTION EVERYTHING: For each {category} purchase, ask: 'Is there a cheaper way to get this same result?'",
                
                f"TRACK & REDUCE: Each month, try to spend 5% less (Rs.{amount * 0.05:,.0f}) in {category} than last month. Gradual improvement adds up!"
            ]
        
        rationale = f"""High spending in one category means opportunity. This isn't about depriving yourself - it's about being smart with YOUR money. Cut {category} spending by 20% and you won't even notice the difference in your life. But you'll definitely notice Rs.{amount * 0.2:,.0f} extra in savings!"""
        
        return Recommendation(
            title=title,
            description=description,
            actionable_steps=actionable_steps,
            estimated_savings=amount * 0.2,
            rationale=rationale
        )
