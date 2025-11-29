import json
import argparse
from agents.orchestrator import OrchestratorAgent

def main():
    """
    Main entry point for the Agentic AI Personal Finance Coach.
    """
    parser = argparse.ArgumentParser(description="Agentic AI Personal Finance Coach")
    parser.add_argument("file", help="Path to transaction data file (CSV or JSON)")
    parser.add_argument("--output", help="Path to save output JSON", default=None)
    parser.add_argument("--pretty", action="store_true", help="Pretty print output")
    
    args = parser.parse_args()
    
    # Initialize orchestrator
    orchestrator = OrchestratorAgent()
    
    # Process transactions
    print(f"\n[*] Processing transactions from: {args.file}\n")
    result = orchestrator.process(args.file)
    
    # Display summary
    # Display summary
    print("\n" + "=" * 80)
    print("$$$  YOUR PERSONAL FINANCIAL COACH REPORT  $$$")
    print("=" * 80)
    print(f"\n{result['summary']}\n")
    
    if result.get('insights'):
        print("-" * 80)
        print(">>>  KEY INSIGHTS (What we found)")
        print("-" * 80)
        # Limit to top 3 insights to avoid overwhelming the user
        top_insights = [i for i in result['insights'] if i['severity'] in ['high', 'medium']][:3]
        if not top_insights and result['insights']:
             top_insights = result['insights'][:1] # Show at least one if no high/medium
             
        for i, insight in enumerate(top_insights, 1):
            severity_map = {"high": "[!]", "medium": "[*]", "low": "[i]"}
            marker = severity_map.get(insight['severity'], '[?]')
            print(f"\n{marker}  {insight['description']}")
    
    if result.get('recommendations'):
        print("\n" + "=" * 80)
        print(">>>  YOUR ACTION PLAN (Let's fix this!)")
        print("=" * 80)
        
        for i, rec in enumerate(result['recommendations'], 1):
            print(f"\nSTEP {i}: {rec['title'].upper()}")
            print("-" * (len(rec['title']) + 8))
            
            print(f"\n[COACH SAYS]:")
            print(f"   \"{rec['description']}\"")
            
            if rec.get('rationale'):
                print(f"\n[WHY THIS MATTERS]:")
                print(f"   {rec['rationale']}")
            
            print(f"\n[ACTION STEPS]:")
            for step in rec['actionable_steps']:
                print(f"   [ ] {step}")
                
            if rec.get('estimated_savings'):
                print(f"\n[POTENTIAL SAVINGS]: Rs.{rec['estimated_savings']:,.0f}/month")
            
            print("\n" + "." * 80)
    
    print("=" * 80 + "\n")
    
    # Save to file if requested
    if args.output:
        # If output is JSON, save raw data
        if args.output.lower().endswith('.json'):
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2 if args.pretty else None)
            print(f"\n[SAVED] Raw data saved to: {args.output}")
        
        # If output is TXT or MD, save the formatted coach report
        else:
            with open(args.output, 'w', encoding='utf-8') as f:
                # Redirect print output to file string
                report = []
                report.append("=" * 80)
                report.append("$$$  YOUR PERSONAL FINANCIAL COACH REPORT  $$$")
                report.append("=" * 80)
                report.append(f"\n{result['summary']}\n")
                
                if result.get('insights'):
                    report.append("-" * 80)
                    report.append(">>>  KEY INSIGHTS (What we found)")
                    report.append("-" * 80)
                    for i, insight in enumerate(result['insights'], 1):
                        severity_map = {"high": "[!]", "medium": "[*]", "low": "[i]"}
                        marker = severity_map.get(insight['severity'], '[?]')
                        report.append(f"\n{marker}  {insight['description']}")
                
                if result.get('recommendations'):
                    report.append("\n" + "=" * 80)
                    report.append(">>>  YOUR ACTION PLAN (Let's fix this!)")
                    report.append("=" * 80)
                    
                    for i, rec in enumerate(result['recommendations'], 1):
                        report.append(f"\nSTEP {i}: {rec['title'].upper()}")
                        report.append("-" * (len(rec['title']) + 8))
                        
                        report.append(f"\n[COACH SAYS]:")
                        report.append(f"   \"{rec['description']}\"")
                        
                        if rec.get('rationale'):
                            report.append(f"\n[WHY THIS MATTERS]:")
                            report.append(f"   {rec['rationale']}")
                        
                        report.append(f"\n[ACTION STEPS]:")
                        for step in rec['actionable_steps']:
                            report.append(f"   [ ] {step}")
                            
                        if rec.get('estimated_savings'):
                            report.append(f"\n[POTENTIAL SAVINGS]: Rs.{rec['estimated_savings']:,.0f}/month")
                        
                        report.append("\n" + "." * 80)
                
                report.append(f"\n[System Confidence: {result['confidence_score'] * 100:.0f}%]")
                report.append("=" * 80 + "\n")
                
                f.write("\n".join(report))
            print(f"\n[SAVED] Coach Report saved to: {args.output}")
    
    # Pretty print full JSON if requested (and not saving to JSON file)
    if args.pretty and not (args.output and args.output.lower().endswith('.json')):
        print("\n[JSON] FULL OUTPUT:")
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
