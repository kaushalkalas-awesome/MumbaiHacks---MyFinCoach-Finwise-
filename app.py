import streamlit as st
import pandas as pd
import plotly.express as px
import os
import tempfile
from agents.orchestrator import OrchestratorAgent

# Page Config
st.set_page_config(
    page_title="Agentic AI Finance Coach",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for "Premium" feel
st.markdown("""
<style>
    .main {
        background-color: #f5f7f9;
    }
    .stCard {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box_shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .metric-container {
        background-color: white;
        padding: 15px;
        border-radius: 8px;
        border-left: 5px solid #4CAF50;
    }
    h1, h2, h3 {
        font-family: 'Inter', sans-serif;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar
st.sidebar.title("💰 AI Finance Coach")
st.sidebar.markdown("---")
uploaded_file = st.sidebar.file_uploader("Upload Transaction Data (CSV/JSON)", type=['csv', 'json'])

st.sidebar.markdown("### 🛠️ Settings")
income_mode = st.sidebar.radio("Income Mode", ["Auto-Detect", "Fixed", "Variable"])

# Main Content
st.title("Your Personal Financial Dashboard")
st.markdown("Welcome back! Let's optimize your wealth.")

if uploaded_file is not None:
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{uploaded_file.name.split('.')[-1]}") as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        tmp_path = tmp_file.name

    try:
        # Initialize Agents
        with st.spinner('🤖 AI Agents are analyzing your finances...'):
            orchestrator = OrchestratorAgent()
            result = orchestrator.process(tmp_path)
            
        # --- TABS ---
        tab1, tab2 = st.tabs(["📊 Dashboard", "🎓 Learn Finance"])
        
        with tab1:
            # --- Dashboard Layout ---
            
            # 1. Top Metrics
            col1, col2, col3, col4 = st.columns(4)
            
            data = result['data']
            income = data['total_income']
            expense = data['total_expense']
            savings = data['net_savings']
            savings_rate = data['savings_rate'] * 100
            
            col1.metric("Total Income", f"Rs.{income:,.0f}", delta_color="normal")
            col2.metric("Total Expenses", f"Rs.{expense:,.0f}", delta="-High" if expense > income else "normal")
            col3.metric("Net Savings", f"Rs.{savings:,.0f}", delta=f"{savings_rate:.1f}% Rate")
            
            # Confidence Score
            confidence = result['confidence_score'] * 100
            col4.metric("AI Confidence", f"{confidence:.0f}%", help="Based on data quality and categorization")

            st.markdown("---")

            # 2. Charts & Breakdown
            c1, c2 = st.columns([2, 1])
            
            with c1:
                st.subheader("💸 Spending by Category")
                if data['spending_by_category']:
                    df_cat = pd.DataFrame(list(data['spending_by_category'].items()), columns=['Category', 'Amount'])
                    fig = px.pie(df_cat, values='Amount', names='Category', hole=0.4, color_discrete_sequence=px.colors.qualitative.Pastel)
                    st.plotly_chart(fig, use_container_width=True)
                else:
                    st.info("No categorical data available.")

            with c2:
                st.subheader("📊 Quick Stats")
                st.write(f"**Fixed Expenses:** Rs.{data['fixed_expenses']:,.0f}")
                st.write(f"**Variable Expenses:** Rs.{data['variable_expenses']:,.0f}")
                st.write(f"**Transactions:** {data['transactions_count']}")
                
                st.markdown("### 🔍 Key Insights")
            
            # Sidebar controls for Education
            with st.sidebar:
                st.markdown("---")
                st.markdown("### 🎓 Learning Settings")
                level = st.select_slider("Complexity Level", options=["beginner", "intermediate", "advanced"])
                lang = st.radio("Language", ["English (en)", "Hinglish (hinglish)"])
                lang_code = "en" if "English" in lang else "hinglish"
            
            # Chat Interface
            if "messages" not in st.session_state:
                st.session_state.messages = [{"role": "assistant", "content": "Hi! I'm your Financial Tutor. Ask me 'What is SIP?' or 'Explain Inflation'."}]

            for msg in st.session_state.messages:
                st.chat_message(msg["role"]).write(msg["content"])

            if prompt := st.chat_input("Type your question here..."):
                st.session_state.messages.append({"role": "user", "content": prompt})
                st.chat_message("user").write(prompt)
                
                # Get response from Education Agent
                edu_agent = EducationAgent()
                response = edu_agent.get_response(prompt, level=level, language=lang_code)
                
                st.session_state.messages.append({"role": "assistant", "content": response})
                st.chat_message("assistant").write(response)

    except Exception as e:
        st.error(f"An error occurred: {e}")
    
    finally:
        # Cleanup
        os.unlink(tmp_path)

else:
    st.info("👈 Please upload a transaction file (CSV) to begin.")
    
    # Demo Data Button
    if st.button("Load Demo Data (Recent Spike)"):
        # Load the demo file directly
        demo_path = "data/dataset8_recent_spike.csv"
        # We can't easily "upload" it, but we can process it directly if we refactor slightly, 
        # but for now let's just tell user to upload it.
        st.warning("For this demo, please drag and drop 'data/dataset8_recent_spike.csv' from your folder into the sidebar!")

