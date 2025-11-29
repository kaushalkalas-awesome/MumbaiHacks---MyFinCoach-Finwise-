try:
    from core.schemas import Transaction, Category, Insight
    print("Schemas imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
