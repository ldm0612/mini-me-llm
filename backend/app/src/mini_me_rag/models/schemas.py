from pydantic import BaseModel, Field


class DirectorDecision(BaseModel):
    """Decision from the agent director."""
    reasoning: str = Field(description="Step-by-step reasoning on retrieved documents relevance.")
    final_decision: bool = Field(description="True if any retrieved doc answers the query, False otherwise.")

# MiniMe final answer model (with CoT reasoning)
class MiniMeAnswer(BaseModel):
    """Answer to user query."""
    answer: str = Field(description="The first-person answer to user query.")
    reasoning: str = Field(description="Reasoning on which story provided is related to this query.")
    
class QueryRequest(BaseModel):
    query: str
    verbose: bool = False
    
class ChatResponse(BaseModel):
    answer: str

class VerboseResponse(BaseModel):
    answer: str
    reasoning: str
    thought_process: str
    time_process: float