from typing import Dict, List, Optional
import random

class EducationAgent:
    """
    Agent 6: Education & Financial Literacy
    Responsibility: Teach financial concepts adaptively based on user level and language.
    """
    
    def __init__(self):
        # Knowledge Base: Topic -> Level -> Language -> Content
        self.knowledge_base = {
            "sip": {
                "beginner": {
                    "en": "Think of SIP (Systematic Investment Plan) not just as saving, but as buying your future freedom. Whether it's that dream trip to Bali or securing your child's education, SIP is the small monthly step that gets you there automatically.",
                    "hinglish": "SIP sirf saving nahi hai, ye aapke sapno ki chabi hai. Chahe wo Bali ki trip ho ya bacchon ki padhai, SIP wo chhota step hai jo aapko wahan tak le jaata hai."
                },
                "intermediate": {
                    "en": "SIP uses Rupee Cost Averaging to beat volatility, but the real power is psychological. It forces you to 'pay yourself first' for your goals (Home, Car, Retirement) before you spend on things you won't remember in a year.",
                    "hinglish": "SIP Rupee Cost Averaging use karta hai, par asli taakat psychological hai. Ye aapko majboor karta hai ki aap pehle apne sapno (Ghar, Gaadi) ke liye paise bachayein, un cheezon par kharch karne se pehle jo yaad bhi nahi rahengi."
                },
                "advanced": {
                    "en": "SIPs are the discipline engine for long-term wealth. By aligning specific SIPs to specific goals (e.g., 'Child Edu Fund'), you create an emotional barrier against withdrawing the money impulsively. It turns money into memories.",
                    "hinglish": "SIPs long-term wealth ka engine hain. Har SIP ko ek goal (jaise 'Child Edu Fund') se jodkar aap emotion use karte hain taaki aap paise nikaal na lein. Ye paison ko yaadon mein badal deta hai."
                }
            },
            "stock": {
                "beginner": {
                    "en": "Buying a stock isn't just trading; it's owning a piece of a business you believe in. Imagine paying for your child's college with the profits from a company that grew while they grew up.",
                    "hinglish": "Stock khareedna sirf trading nahi, ek business ka hissa banna hai. Sochiye, jis company ko aapne grow hote dekha, uske profit se aap apne bacchon ki college fees bhar rahe hain."
                },
                "intermediate": {
                    "en": "Stocks offer the highest potential growth to beat inflation. This is crucial because 'safe' investments might not grow enough to fund your 20-year retirement vacation plans. Stocks bridge that gap.",
                    "hinglish": "Stocks inflation ko beat karne ke liye zaroori hain. 'Safe' investments shayad itna grow na karein ki aapki 20 saal ki retirement vacation fund ho sake. Stocks wo kami poori karte hain."
                },
                "advanced": {
                    "en": "Value investing is about patience and conviction. It's like planting a tree; you don't dig it up every day to check the roots. You wait, knowing it will provide shade (financial security) for your family later.",
                    "hinglish": "Value investing sabr ka khel hai. Ye ped lagane jaisa hai; aap roz jad check nahi karte. Aap bharosa rakhte hain ki ye baad mein aapki family ko chhaon (financial security) dega."
                }
            },
            "mutual_fund": {
                "beginner": {
                    "en": "A Mutual Fund is a team effort to make your money grow. It's perfect for goals like a destination wedding or buying a car, where you need professional help to grow your savings faster than a bank account.",
                    "hinglish": "Mutual Fund ek team effort hai paisa badhane ka. Ye destination wedding ya car lene jaise sapno ke liye perfect hai, jahan aapko bank se tez growth chahiye."
                },
                "intermediate": {
                    "en": "Mutual Funds offer diversification, which protects your dreams. If one sector fails, others hold up, ensuring your 'House Down Payment Fund' stays safe. It's risk management for your life goals.",
                    "hinglish": "Mutual Funds diversification dete hain jo aapke sapno ko bachata hai. Agar ek sector girta hai, toh doosre sambhal lete hain, taaki aapka 'Ghar ka Fund' safe rahe."
                },
                "advanced": {
                    "en": "Direct Mutual Funds save you commissions, which compounds hugely over time. That extra 1% saved over 20 years could literally be the cost of a world tour. Don't leave that money on the table.",
                    "hinglish": "Direct Mutual Funds commission bachate hain. 20 saal mein wo bacha hua 1% ek world tour ke barabar ho sakta hai. Wo paisa waste mat kijiye."
                }
            },
            "inflation": {
                "beginner": {
                    "en": "Inflation is why a samosa cost Rs. 5 ten years ago but costs Rs. 15 today. It's the 'silent thief' that reduces what your money can buy over time.",
                    "hinglish": "Inflation woh hai jis wajah se samosa 10 saal pehle 5 rupaye ka tha par aaj 15 ka hai. Ye ek 'silent thief' hai jo aapke paison ki value kam karta rehta hai."
                },
                "intermediate": {
                    "en": "Inflation is the rate at which prices rise. If inflation is 6% and your bank gives 4% interest, you are actually LOSING purchasing power. You need investments that beat inflation.",
                    "hinglish": "Inflation mehangai badhne ki rate hai. Agar inflation 6% hai aur bank 4% interest deta hai, toh aap asal mein paise kho rahe hain. Aapko inflation se zyada return chahiye."
                },
                "advanced": {
                    "en": "Real Rate of Return = Nominal Return - Inflation Rate. To build wealth, you need positive real returns. Equity and Real Estate are asset classes historically known to beat inflation over the long term.",
                    "hinglish": "Real Rate of Return = Nominal Return - Inflation Rate. Wealth banane ke liye positive real return chahiye. Equity aur Real Estate long term mein inflation ko beat karne ke liye jaane jaate hain."
                }
            }
        }
        
        self.default_responses = [
            "That's a great topic! Let's dive in.",
            "Financial literacy is a superpower. Here's what you need to know.",
            "Good question! Here is the simple explanation."
        ]

    def get_response(self, query: str, level: str = "beginner", language: str = "en") -> str:
        """
        Returns an educational response based on the query topic.
        """
        query = query.lower()
        topic = None
        
        # Simple keyword matching for topic detection
        if "sip" in query:
            topic = "sip"
        elif "stock" in query or "share" in query or "equity" in query:
            topic = "stock"
        elif "mutual fund" in query or "mf" in query:
            topic = "mutual_fund"
        elif "inflation" in query or "cost" in query:
            topic = "inflation"
            
        if topic:
            # Get content from knowledge base
            content_dict = self.knowledge_base.get(topic, {}).get(level, {})
            # Fallback to English if language not found
            explanation = content_dict.get(language, content_dict.get("en", "Information not available."))
            
            intro = random.choice(self.default_responses)
            return f"{intro}\n\n**{topic.upper()} ({level.title()}):**\n{explanation}"
        
        else:
            return "I can teach you about SIPs, Stocks, Mutual Funds, and Inflation. What would you like to learn?"

    def suggest_learning_path(self, user_profile: str) -> List[str]:
        """
        Suggests topics based on user profile (e.g., 'saver', 'investor').
        """
        if user_profile == "saver":
            return ["What is Inflation?", "Introduction to Mutual Funds", "Why SIP?"]
        else:
            return ["Advanced Stock Valuation", "Direct vs Regular Mutual Funds", "Asset Allocation"]
