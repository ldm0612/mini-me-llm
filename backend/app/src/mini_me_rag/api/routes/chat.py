from fastapi import APIRouter, Depends, HTTPException, Request
from mini_me_rag.models.schemas import QueryRequest, ChatResponse, VerboseResponse
from typing import Union


router = APIRouter()

@router.post("/chat", response_model=Union[ChatResponse, VerboseResponse])
def generate_answer(query_request: QueryRequest, req: Request):
    minime = req.app.state.minime
    result = minime.generate(query_request.query, verbose=query_request.verbose)

    if query_request.verbose:
        return VerboseResponse(**result)
    else:
        return ChatResponse(answer=result)
