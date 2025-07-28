import pandas as pd
import json
from docx import Document
import os


def load_config(config_path="mini_me_rag/config/config.json"):
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found at {config_path}")
    
    with open(config_path, "r") as f:
        try:
            config = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in config file: {e}")
    
    return config

config = load_config()

doc_data_path = config.get("doc_data_path") 
json_data_path = config.get("json_data_path")


def get_qa(): 
    doc = Document(doc_data_path)

    full_text = "\n".join([p.text for p in doc.paragraphs])
    full_text_list = full_text.split()  # Split into words

    questions = []
    answers = []
    is_q = False
    question = ""
    answer = ""

    for word in full_text_list:
        if word == "#Question#" and not is_q:
            # Switch to question mode
            if answer.strip():  # save previous answer if exists
                answers.append(answer.strip())
            is_q = True
            question = ""
        elif word == "#Question#" and is_q:
            # Switch to answer mode
            if question.strip():  # save previous question if exists
                questions.append(question.strip())
            is_q = False
            answer = ""
        else:
            if is_q:
                question += word + " "
            else:
                answer += word + " "

    # Save the last answer
    if answer.strip():
        answers.append(answer.strip())

    assert len(questions) == len(answers)
    
    return questions, answers


def save_data(questions, answers):
    qa_data = [{"question": q, "answer": a} for q, a in zip(questions, answers)]
    with open(json_data_path, "w", encoding="utf-8") as f:
        json.dump(qa_data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    questions, answers = get_qa()
    save_data(questions, answers)
    print(f"Processed and saved {len(questions)} Q&A pairs to data/bq_questions.json")