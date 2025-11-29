from typing import List, Dict, Any
from datetime import datetime
from agents.ingestion import IngestionAgent
from agents.categorization import CategorizationAgent
from agents.analytics import AnalyticsAgent
from agents.recommendation import RecommendationAgent
from core.schemas import Transaction, AgentLog, AnalysisResult, Recommendation
from core.utils import setup_logger

logger = setup_logger("orchestrator_agent")

class OrchestratorAgent:
    """
    Agent 5: Conversation & Orchestration Agent
    Responsibility: Coordinates all other agents and provides the final output.
    """

    def __init__(self):
        self.ingestion_agent = IngestionAgent()
        self.categorization_agent = CategorizationAgent()
        self.analytics_agent = AnalyticsAgent()
        self.recommendation_agent = RecommendationAgent()
        self.logs: List[AgentLog] = []

    def process(self, file_path: str) -> Dict[str, Any]:
        """
        Main orchestration method that coordinates all agents.
        
        Args:
            file_path: Path to transaction data file (CSV or JSON)
            
        Returns:
            Complete analysis result with insights and recommendations
        """
        logger.info(f"Starting orchestration for file: {file_path}")
        
        try:
            # Step 1: Ingestion
            self._log("IngestionAgent", "Starting", "Parsing and normalizing transaction data")
            transactions = self.ingestion_agent.ingest(file_path)
            self._log("IngestionAgent", "Completed", f"Processed {len(transactions)} transactions")
            
            if not transactions:
                logger.warning("No transactions found in file")
                return self._empty_result()
            
            # Step 2: Categorization
            self._log("CategorizationAgent", "Starting", "Categorizing transactions")
            categorized_transactions = self.categorization_agent.categorize(transactions)
            self._log("CategorizationAgent", "Completed", f"Categorized {len(categorized_transactions)} transactions")
            
            # Step 3: Analytics
            self._log("AnalyticsAgent", "Starting", "Analyzing patterns and behaviors")
            analysis = self.analytics_agent.analyze(categorized_transactions)
            self._log("AnalyticsAgent", "Completed", f"Generated {len(analysis.insights)} insights")
            
            # Step 4: Recommendations
            self._log("RecommendationAgent", "Starting", "Generating personalized recommendations")
            recommendations = self.recommendation_agent.generate_recommendations(analysis, categorized_transactions)
            self._log("RecommendationAgent", "Completed", f"Generated {len(recommendations)} recommendations")
            
            # Step 5: Assemble final result
            result = self._build_response(
                transactions=categorized_transactions,
                analysis=analysis,
                recommendations=recommendations
            )
            
            logger.info("Orchestration completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Orchestration failed: {e}")
            raise

    def _log(self, agent_name: str, action: str, details: str):
        """
        Logs agent actions for traceability.
        """
        log_entry = AgentLog(
            agent_name=agent_name,
            action=action,
            details=details
        )
        self.logs.append(log_entry)
        logger.info(f"[{agent_name}] {action}: {details}")

    def _build_response(self, transactions: List[Transaction], 
                       analysis: AnalysisResult, 
                       recommendations: List[Recommendation]) -> Dict[str, Any]:
        """
        Builds the final structured response.
        """
        # Calculate confidence score
        confidence = self._calculate_confidence(transactions, analysis)
        
        # Build natural language summary
        summary = self._generate_summary(analysis, recommendations)
        
        return {
            "status": "success",
            "confidence_score": confidence,
            "summary": summary,
            "data": {
                "transactions_count": len(transactions),
                "total_income": analysis.total_income,
                "total_expense": analysis.total_expense,
                "net_savings": analysis.total_income - analysis.total_expense,
                "savings_rate": (analysis.total_income - analysis.total_expense) / analysis.total_income if analysis.total_income > 0 else 0,
                "fixed_expenses": analysis.fixed_expenses_total,
                "variable_expenses": analysis.variable_expenses_total,
                "spending_by_category": analysis.spending_by_category
            },
            "insights": [
                {
                    "type": insight.insight_type,
                    "description": insight.description,
                    "severity": insight.severity
                }
                for insight in analysis.insights
            ],
            "recommendations": [
                {
                    "title": rec.title,
                    "description": rec.description,
                    "actionable_steps": rec.actionable_steps,
                    "estimated_savings": rec.estimated_savings,
                    "rationale": rec.rationale
                }
                for rec in recommendations
            ],
            "logs": [
                {
                    "agent": log.agent_name,
                    "action": log.action,
                    "details": log.details,
                    "timestamp": log.timestamp.isoformat()
                }
                for log in self.logs
            ]
        }

    def _calculate_confidence(self, transactions: List[Transaction], 
                             analysis: AnalysisResult) -> float:
        """
        Calculates overall confidence score based on data quality.
        """
        if not transactions:
            return 0.0
        
        # Factors affecting confidence:
        # 1. How many transactions are categorized?
        categorized_count = sum(1 for t in transactions if t.category and t.category != "Uncategorized")
        categorization_rate = categorized_count / len(transactions)
        
        # 2. Average confidence of categorizations
        avg_confidence = sum(t.confidence_score for t in transactions) / len(transactions)
        
        # 3. Data completeness (all required fields present)
        complete_count = sum(1 for t in transactions if t.merchant and t.description)
        completeness_rate = complete_count / len(transactions)
        
        # Weighted average
        confidence = (categorization_rate * 0.4 + avg_confidence * 0.4 + completeness_rate * 0.2)
        
        return round(confidence, 2)

    def _generate_summary(self, analysis: AnalysisResult, 
                         recommendations: List[Recommendation]) -> str:
        """
        Generates a human-readable summary.
        """
        summary_parts = []
        
        # Financial overview
        net_savings = analysis.total_income - analysis.total_expense
        savings_rate = (net_savings / analysis.total_income * 100) if analysis.total_income > 0 else 0
        
        summary_parts.append(
            f"You earned Rs.{analysis.total_income:,.2f} and spent Rs.{analysis.total_expense:,.2f}, "
            f"saving Rs.{net_savings:,.2f} ({savings_rate:.1f}% savings rate)."
        )
        
        # Fixed vs Variable
        summary_parts.append(
            f"Your expenses consist of Rs.{analysis.fixed_expenses_total:,.2f} in fixed costs "
            f"and Rs.{analysis.variable_expenses_total:,.2f} in variable spending."
        )
        
        # Top spending category
        if analysis.spending_by_category:
            top_category = max(analysis.spending_by_category.items(), key=lambda x: x[1])
            summary_parts.append(
                f"Your highest spending category is {top_category[0]} at Rs.{top_category[1]:,.2f}."
            )
        
        # Key insights
        if analysis.insights:
            high_severity = [i for i in analysis.insights if i.severity == "high"]
            if high_severity:
                summary_parts.append(
                    f"[!] Important: {high_severity[0].description}"
                )
        
        # Recommendations teaser
        if recommendations:
            summary_parts.append(
                f"We've identified {len(recommendations)} opportunities to improve your financial health."
            )
        
        return " ".join(summary_parts)

    def _empty_result(self) -> Dict[str, Any]:
        """
        Returns empty result when no data is available.
        """
        return {
            "status": "no_data",
            "confidence_score": 0.0,
            "summary": "No transaction data found to analyze.",
            "data": {},
            "insights": [],
            "recommendations": [],
            "logs": []
        }
