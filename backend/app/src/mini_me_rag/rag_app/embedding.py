from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os, sys, json, shutil

from mini_me_rag.rag_app.preprocess import load_config

load_dotenv()
config = load_config()

IS_USING_IMAGE_RUNTIME = bool(os.environ.get("IS_USING_IMAGE_RUNTIME", False))

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

# Vector‑store cache 
_VECTOR_STORE: Chroma | None = None
_TMP_PATH = "/tmp/chroma_db"      

# Check if it's running on AWS
IS_IMAGE = os.getenv("IS_USING_IMAGE_RUNTIME", "False").lower() == "true"

def _ensure_tmp_copy(src: str) -> str:
    """Return path that Chroma may write to."""
    if not IS_IMAGE:          # running on laptop / non‑container
        return src            # use original read‑write path
    
    import pysqlite3; 
    sys.modules["sqlite3"] = pysqlite3 # replace sqlite3 with pysqlite3 if running on container

    if not os.path.exists(_TMP_PATH):      # first cold‑start copy
        shutil.copytree(src, _TMP_PATH, dirs_exist_ok=True)
    return _TMP_PATH

def create_vector_store(save_path):
    json_data_path = config.get("json_data_path")
    vector_store_path = config.get("vector_store_path")

    with open(json_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        documents = [
            Document(
                page_content = data['question'],
                metadata = {
                    "answer": data['answer']
                }
            ) 
            for qa in data
        ]
    
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=save_path
    )
    vector_store.persist()
    print(f"Vector Store Saved Successfully to {save_path}")
    

def load_vector_store(load_path: str) -> Chroma:
    """Load (and cache) the vector store in Lambda‑safe /tmp."""
    global _VECTOR_STORE
    if _VECTOR_STORE:          # warm invocation → reuse
        return _VECTOR_STORE

    path_for_chroma = _ensure_tmp_copy(load_path)
    _VECTOR_STORE = Chroma(
        embedding_function=embedding_model,
        persist_directory=path_for_chroma
    )
    return _VECTOR_STORE

def save_vector_store(vector_store, save_path):
    vector_store.save_local(save_path)

