# Agentic AI Personal Finance Coach - Enhanced

## ✨ Recent Enhancement: Income-Type Personalized Recommendations

The system now **automatically detects** whether users have **fixed (salaried)** or **variable (freelance/business)** income and provides personalized financial advice accordingly.

### How It Works

**Income Detection Algorithm**:
1. Analyzes income transaction patterns
2. Checks for amount regularity (< 10% variance = fixed)
3. Checks for monthly consistency (1-2 transactions/month = fixed)
4. Otherwise classifies as variable income

**Personalized Recommendations**:

| Income Type | Target Savings | Key Strategies |
|------------|----------------|----------------|
| **Fixed** (Salaried) | 20% minimum | Automation, 50/30/20 rule, monthly SIPs |
| **Variable** (Freelancer) | 30-40% | Emergency fund, buffer accounts, live on min income |
| **Unknown** | 20% minimum | Generic balanced advice |

### Example Outputs

#### Fixed Income User:
```
[RECOMMENDATIONS]
1. Improve Your Savings Rate (Fixed Income Strategy)
   - Set up automatic transfers on payday
   - Use the 50/30/20 rule
   - Increase savings by 1% each month
   - Consider automated investment SIPs
```

#### Variable Income User:
```
[RECOMMENDATIONS]
1. Build Financial Buffer (Variable Income Strategy)
   - Aim to save 30-40% to buffer lean months
   - Create business checking account
   - Live on lowest monthly income
   - Build 6-month emergency fund first
```

---

## Full Feature List

✅ Multi-agent architecture (5 specialized agents)  
✅ CSV & JSON data ingestion  
✅ 11-category classification  
✅ Fixed/variable expense tracking  
✅ 5 pattern detection algorithms  
✅ **🆕 Income-type personalized recommendations**  
✅ Confidence scoring  
✅ Comprehensive logging  
✅ CLI interface  

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Test with fixed income user (salaried)
python main.py data/dataset7_fixed_income_low_savings.csv

# Test with variable income user (freelancer)
python main.py data/dataset6_freelancer_income.csv

# Test with other patterns
python main.py data/dataset1_coffee_addiction.csv
python main.py data/dataset2_weekend_splurge.csv
python main.py data/dataset3_subscription_trap.csv
```

## Dataset Summary

| Dataset | Income Type | Key Pattern | Recommended For |
|---------|------------|-------------|-----------------|
| dataset1 | Unknown | Coffee addiction (spend leak) | Testing spend leak detection |
| dataset2 | Fixed | Weekend overspending | Testing weekend pattern |
| dataset3 | Fixed | Subscription trap | Testing recurring expenses |
| dataset4 | Fixed | Good savings habits | Positive behavior examples |
| dataset5 | Fixed | Poor spending | Critical recommendations |
| dataset6 | **Variable** | Freelancer income | **Variable income testing** |
| dataset7 | **Fixed** | Salaried low savings | **Fixed income testing** |

---

See [data/README.md](file:///r:/Agents/data/README.md) for detailed dataset descriptions.
