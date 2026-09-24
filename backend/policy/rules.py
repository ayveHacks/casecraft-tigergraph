from enum import Enum
from typing import List, Dict, Any, Optional

class ActionName(str, Enum):
    ALLOW_TRANSACTION = "ALLOW_TRANSACTION"
    DECLINE_TRANSACTION = "DECLINE_TRANSACTION"
    MONITOR_CARD = "MONITOR_CARD"
    MONITOR_CONNECTED_CARDS = "MONITOR_CONNECTED_CARDS"
    WARN_CUSTOMER = "WARN_CUSTOMER"
    VERIFY_WITH_CUSTOMER = "VERIFY_WITH_CUSTOMER"
    STEP_UP_AUTH = "STEP_UP_AUTH"
    BLOCK_CARD = "BLOCK_CARD"
    BLOCK_ALL_CARDS = "BLOCK_ALL_CARDS"
    GENERATE_REPORT = "GENERATE_REPORT"
    CREATE_CASE = "CREATE_CASE"
    FILE_REPORT = "FILE_REPORT"
    ESCALATE_TO_ANALYST = "ESCALATE_TO_ANALYST"
    CLOSE_NO_FRAUD = "CLOSE_NO_FRAUD"

def determine_approval_route(action: ActionName, exposure: float) -> str:
    if action in [
        ActionName.ALLOW_TRANSACTION, ActionName.MONITOR_CARD,
        ActionName.MONITOR_CONNECTED_CARDS, ActionName.WARN_CUSTOMER,
        ActionName.VERIFY_WITH_CUSTOMER, ActionName.STEP_UP_AUTH,
        ActionName.GENERATE_REPORT, ActionName.CREATE_CASE,
        ActionName.ESCALATE_TO_ANALYST, ActionName.CLOSE_NO_FRAUD
    ]:
        return "AUTO"
    
    if action == ActionName.DECLINE_TRANSACTION:
        return "L1"
        
    if action == ActionName.BLOCK_CARD:
        return "L1" if exposure <= 2500 else "L2"
        
    if action in [ActionName.BLOCK_ALL_CARDS, ActionName.FILE_REPORT]:
        return "L2"
        
    return "L2" # Default safe

def evaluate_policy(context: Dict[str, Any]) -> List[Dict[str, str]]:
    actions = []
    
    fraud_prob = context.get('fraud_probability', 0.0)
    customer_response = context.get('customer_response')
    exposure = context.get('exposure_usd', 0.0)
    pattern = context.get('pattern')
    shared_fraud = context.get('shared_fraud', False)
    
    # R1: Weak signal
    if fraud_prob < 0.70 and fraud_prob >= 0.30 and not customer_response:
        actions.append({"action": ActionName.VERIFY_WITH_CUSTOMER.value, "reason": "R1: Weak signal, verify before block"})
        
    # R2: Customer denies
    if customer_response == 'DENIES':
        actions.append({"action": ActionName.BLOCK_CARD.value, "reason": "R2: Customer denies"})
        actions.append({"action": ActionName.CREATE_CASE.value, "reason": "R2: Customer denies"})
        if exposure > 1000 or shared_fraud:
            actions.append({"action": ActionName.FILE_REPORT.value, "reason": "R2: Exposure > $1000 or shared fraud"})
            
    # R3: Customer confirms
    if customer_response == 'CONFIRMS':
        actions.append({"action": ActionName.CLOSE_NO_FRAUD.value, "reason": "R3: Customer confirms"})
        
    # R4: No reply in 24h (Simulated by 'NO_REPLY')
    if customer_response == 'NO_REPLY':
        actions.append({"action": ActionName.MONITOR_CARD.value, "reason": "R4: No reply"})
        actions.append({"action": ActionName.DECLINE_TRANSACTION.value, "reason": "R4: No reply"})
        if exposure > 500:
            actions.append({"action": ActionName.ESCALATE_TO_ANALYST.value, "reason": "R4: No reply and high exposure"})
            
    # R5: Card testing
    if pattern == 'card_testing':
        actions.append({"action": ActionName.DECLINE_TRANSACTION.value, "reason": "R5: Card testing pattern"})
        actions.append({"action": ActionName.STEP_UP_AUTH.value, "reason": "R5: Card testing pattern"})
        if exposure > 100:
            actions.append({"action": ActionName.BLOCK_CARD.value, "reason": "R5: Card testing > $100"})
            
    # R6: Shared origin
    if pattern == 'shared_origin' and shared_fraud:
        actions.append({"action": ActionName.CREATE_CASE.value, "reason": "R6: Shared origin fraud"})
        actions.append({"action": ActionName.FILE_REPORT.value, "reason": "R6: Shared origin fraud"})
        actions.append({"action": ActionName.MONITOR_CONNECTED_CARDS.value, "reason": "R6: Shared origin fraud"})
        
    # R7: Disputed but legitimate recurring pattern
    if pattern == 'legitimate_recurring' and customer_response == 'DISPUTES':
        actions.append({"action": ActionName.CREATE_CASE.value, "reason": "R7: Disputed recurring"})
        actions.append({"action": ActionName.VERIFY_WITH_CUSTOMER.value, "reason": "R7: Disputed recurring"})
        actions.append({"action": ActionName.WARN_CUSTOMER.value, "reason": "R7: Disputed recurring"})
        
    # R8: Uncertain + exposure > $500 OR conflicting evidence
    conflicting = context.get('conflicting_evidence', False)
    if (0.3 < fraud_prob < 0.7 and exposure > 500) or conflicting:
        actions.append({"action": ActionName.ESCALATE_TO_ANALYST.value, "reason": "R8: Uncertain high exposure or conflict"})
        
    # R9: Undocumented coordinated/repeated abuse
    if pattern == 'undocumented' and fraud_prob > 0.7:
        actions.append({"action": ActionName.CREATE_CASE.value, "reason": "R9: Undocumented abuse"})
        actions.append({"action": ActionName.FILE_REPORT.value, "reason": "R9: Undocumented abuse"})
        actions.append({"action": ActionName.ESCALATE_TO_ANALYST.value, "reason": "R9: Undocumented abuse"})
        
    # R10: Never BLOCK_ALL_CARDS unless 2+ customer cards confirmed fraud OR credentials compromised
    compromised = context.get('credentials_compromised', False)
    confirmed_fraud_cards = context.get('confirmed_fraud_cards', 0)
    if compromised or confirmed_fraud_cards >= 2:
        actions.append({"action": ActionName.BLOCK_ALL_CARDS.value, "reason": "R10: Multiple cards compromised"})

    # Ensure uniqueness and attach routing
    final_actions = []
    seen = set()
    for act in actions:
        if act['action'] not in seen:
            seen.add(act['action'])
            act['route'] = determine_approval_route(ActionName(act['action']), exposure)
            final_actions.append(act)
            
    # Default legitimate fallback
    if not final_actions and fraud_prob < 0.3:
        final_actions.append({"action": ActionName.ALLOW_TRANSACTION.value, "route": "AUTO", "reason": "Low probability"})
        
    return final_actions
