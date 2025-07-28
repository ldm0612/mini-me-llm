from langchain_openai import ChatOpenAI
from mini_me_rag.rag_app.preprocess import load_config
from mini_me_rag.rag_app.embedding import load_vector_store
from mini_me_rag.models.schemas import MiniMeAnswer
from mini_me_rag.prompt.prompt import GENERATION_PROMPT, DIRECTOR_PROMPT, REWRITE_PROMPT
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import time

load_dotenv()
config = load_config()
vector_store_path = config.get("vector_store_path")


# Director structured output model
class DirectorDecision(BaseModel):
    """Decision from the agent director."""
    reasoning: str = Field(description="Step-by-step reasoning on retrieved documents relevance.")
    final_decision: bool = Field(description="True if any retrieved doc answers the query, False otherwise.")

# RAG final answer model (with CoT reasoning)
class MiniMeAnswer(BaseModel):
    """Answer to user query."""
    answer: str = Field(description="The first-person answer to user query.")
    reasoning: str = Field(description="Reasoning on which story provided is related to this query.")


# Full Workflow
class MiniMe:
    def __init__(self):
        self.vector_store = load_vector_store(vector_store_path)
        self.llm = ChatOpenAI()
        self.director_client = self.llm.with_structured_output(DirectorDecision)
        self.generator_client = self.llm.with_structured_output(MiniMeAnswer)
        self.generation_prompt = GENERATION_PROMPT

    def retrieve(self, query, k=3):
        """Retrieve top-k documents from vector store"""
        return self.vector_store.similarity_search_with_score(query, k=k)

    def agent_director(self, query, retrieved_docs):
        """Agent director reasons if retrieved docs answer the query."""
        retrieved_text = "\n".join(
            [f"{i+1}. {doc[0].page_content}" for i, doc in enumerate(retrieved_docs)]
        )
        prompt = DIRECTOR_PROMPT.format(query=query, retrieved_text=retrieved_text)
        decision = self.director_client.invoke(prompt)
        return decision

    def rewrite_and_retrieve(self, original_query, k=3):
        """Rewrite the query and retrieve new documents"""
        prompt = REWRITE_PROMPT.format(original_query=original_query)
        rewritten_query = self.llm.invoke(prompt).content.strip()
        if rewritten_query.upper() == "UNRELATED":
            return rewritten_query, []
        new_docs = self.retrieve(rewritten_query, k)
        return rewritten_query, new_docs

    def generate_final_answer(self, query, retrieved_docs):
        """Compose final answer using generation LLM"""
        references = ""
        for i, doc in enumerate(retrieved_docs):
            references += f"Reference Question #{i+1}:\n{doc[0].page_content}\n"
            references += f"Reference Answer #{i+1}:\n{doc[0].metadata.get('answer', '')}\n\n"

        prompt_text = self.generation_prompt.format(query=query, references=references)
        result = self.generator_client.invoke(prompt_text)
        return result, references, prompt_text

    def generate(self, query, max_retries=2, verbose=False):
        """Main workflow: retrieve → reason → rewrite+retrieve (max 2) → generate"""
        start_time = time.time()
        thought_process = []  # Long string collected as a list of lines

        thought_process.append("=== Agentic Workflow Started ===\n")

        # Step 1: Initial retrieval
        retrieved_docs = self.retrieve(query)
        thought_process.append("Step 1: Initial Retrieval")
        for i, doc in enumerate(retrieved_docs):
            thought_process.append(f"- Retrieved #{i+1}: {doc[0].page_content.strip()}\n")

        # Step 2: Director reasoning
        decision = self.agent_director(query, retrieved_docs)
        thought_process.append("Step 2: Director Reasoning (Initial Retrieval)")
        thought_process.append(decision.reasoning)
        thought_process.append(f"Final Decision: {'YES' if decision.final_decision else 'NO'}\n")

        if decision.final_decision:
            return self._finalize(query, retrieved_docs, start_time, thought_process, verbose)

        # Retry Loop
        for attempt in range(1, max_retries + 1):
            thought_process.append(f"Step 3: Rewrite + Retrieve (Retry #{attempt})")
            rewritten_query, retrieved_docs = self.rewrite_and_retrieve(query)
            thought_process.append(f"- Rewritten Query: {rewritten_query}")

            if rewritten_query.upper() == "UNRELATED":
                thought_process.append("Rewrite tool determined the query is unrelated.\n")
                return self._finalize(query, [], start_time, thought_process, verbose)

            decision = self.agent_director(query, retrieved_docs)
            thought_process.append("Director Reasoning (After Rewrite)")
            thought_process.append(decision.reasoning)
            thought_process.append(f"Final Decision: {'YES' if decision.final_decision else 'NO'}\n")

            if decision.final_decision:
                return self._finalize(query, retrieved_docs, start_time, thought_process, verbose)

        # If still insufficient after retries
        thought_process.append("Director: All retries exhausted. No sufficient docs found.\n")
        return self._finalize(query, [], start_time, thought_process, verbose)

    def _finalize(self, query, retrieved_docs, start_time, thought_process, verbose):
        """Finalize the process with generation and return results"""
        result, refs, prompt_text = self.generate_final_answer(query, retrieved_docs)
        total_time = time.time() - start_time

        thought_process.append("Step 4: Final Generation Reasoning")
        thought_process.append(result.reasoning)
        thought_process.append(f"Total Time: {total_time:.2f}s")
        thought_process_str = "\n".join(thought_process)

        if verbose:
            return {
                "answer": result.answer,
                "reasoning": result.reasoning,
                "thought_process": thought_process_str,
                "time_process": round(total_time, 2)
            }
        else:
            return result.answer
