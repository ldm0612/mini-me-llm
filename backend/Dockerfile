# -------- Stage 1 --------
FROM python:3.11-slim as builder
WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --target=/app/python -r requirements.txt

# -------- Stage 2 --------
FROM public.ecr.aws/lambda/python:3.11
WORKDIR /var/task

# 1. Dependencies
COPY --from=builder /app/python ./python

# 2. App code  (note new path!)
COPY app/src/mini_me_rag ./mini_me_rag

# 3. Vector-store / data
COPY app/data ./data         


ENV PYTHONPATH="/var/task:/var/task/python"
ENV IS_USING_IMAGE_RUNTIME=True

CMD ["mini_me_rag.api.main.handler"]
