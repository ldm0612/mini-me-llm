from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from mini_me_rag.api.routes.chat import router as chat_router
from mini_me_rag.rag_app.rag import MiniMe

app = FastAPI()
handler = Mangum(app)

@app.on_event("startup")
async def startup_event():
    app.state.minime = MiniMe()  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok"}


app.include_router(chat_router)

if __name__ == "__main__":
    import uvicorn
    port = 8000
    print(f"Running the FastAPI server on port {port}.")
    uvicorn.run("mini_me_rag.api.main:app", host="0.0.0.0", port=port)
