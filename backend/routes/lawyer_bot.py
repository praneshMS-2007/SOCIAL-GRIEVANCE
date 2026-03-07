from fastapi import APIRouter
from pydantic import BaseModel
from ai_engine import lawyer_bot_response

router = APIRouter(prefix="/api/lawyer-bot", tags=["Lawyer Bot"])


class LawyerBotQuery(BaseModel):
    grievance_text: str
    category: str = "General"


@router.post("/ask")
async def ask_lawyer_bot(data: LawyerBotQuery):
    """Get legal entitlement guidance from the AI lawyer bot."""
    response = await lawyer_bot_response(data.grievance_text, data.category)
    return {
        "success": True,
        "response": response,
        "category": data.category
    }
