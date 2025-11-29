# Summary of Datasets & Income Detection

## 📊 Available Test Datasets

### 1. **Coffee Addiction** (`dataset1_coffee_addiction.csv/json`)
- **Pattern**: Spend leak - multiple small Starbucks purchases
- **Income Type**: Unknown (single income entry)
- **Insights**: Weekend overspending detected

### 2. **Weekend Splurge** (`dataset2_weekend_splurge.csv/json`)
- **Pattern**: Weekend overspending
- **Income Type**: Fixed
- **Insights**: 3-4x higher weekend spending

### 3. **Subscription Trap** (`dataset3_subscription_trap.csv/json`)
- **Pattern**: Multiple recurring subscriptions
- **Income Type**: Fixed
- **Insights**: 20+ subscriptions totaling ~Rs. 15K/month

### 4. **Good Habits** (`dataset4_good_habits.csv/json`)
- **Pattern**: High savings, investments
- **Income Type**: Fixed
- **Insights**: ~60% savings rate, controlled spending

### 5. **Poor Habits** (`dataset5_poor_habits.csv/json`)
- **Pattern**: Overspending, negative savings
- **Income Type**: Fixed
- **Insights**: Multiple high-severity issues

### 6. **Freelancer Income** (`dataset6_freelancer_income.csv`)
- **Pattern**: Variable income streams
- **Income Type**: **Variable** (irregular amounts, multiple clients)
- **Insights**: Different recommendation style for freelancers

### 7. **Fixed Income Low Savings** (`dataset7_fixed_income_low_savings.csv`)
- **Pattern**: Salaried employee overspending
- **Income Type**: **Fixed** (regular monthly salary)
- **Insights**: Fixed income specific recommendations

---

## 🔍 Income Type Detection Logic

The system automatically detects income type based on transaction patterns:

### **Fixed Income** (Salaried):
- Regular monthly income (1-2 transactions/month)
- Same or very similar amounts (< 10% variance)
- **Recommendation Style**: Focus on percentage-based savings, automation, 50/30/20 rule

### **Variable Income** (Freelancer/Business):
- Irregular amounts from multiple sources
- Unpredictable timing
- **Recommendation Style**: Focus on emergency fund (6 months), higher savings target (30-40%), buffer strategies

### **Unknown**:
- Insufficient data (< 2 income transactions)
- **Recommendation Style**: Generic advice

---

## 💡 Recommendation Differences

### For Fixed Income Users:
```
"Improve Your Savings Rate (Fixed Income Strategy)"
- Set up automatic transfers on payday
- Use the 50/30/20 rule
- Increase savings by 1% monthly
- Consider automated SIPs
- Review variable expenses monthly
```

### For Variable Income Users:
```
"Build Financial Buffer (Variable Income Strategy)"
- Aim to save 30-40% (higher than salaried)
- Create business checking account
- Live on lowest monthly income
- Build 6month emergency fund first
- Track average monthly income over 6 months
```

---

## 🧪 Testing Different Income Types

```bash
# Test Fixed Income Detection
python main.py data/dataset7_fixed_income_low_savings.csv

# Test Variable Income Detection
python main.py data/dataset6_freelancer_income.csv

# Test with Unknown Income
python main.py data/dataset1_coffee_addiction.csv
```

Look for this line in the output:
```
2025 - recommendation_agent - INFO - Detected income type: fixed  # or variable/unknown
```

---

## 📝 Creating Custom Datasets

### For Fixed Income:
- Include 2+ income transactions
- Use same amount each month
- Label as income from single employer

### For Variable Income:
- Include multiple income sources
- Vary amounts significantly
- Use different merchant names (clients)
