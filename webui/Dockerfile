FROM weastur/poetry:1.8.3-python-3.12-bookworm

WORKDIR /app/webui

COPY .python-version ./
COPY pyproject.toml poetry.lock ./

RUN poetry env use 3.12
RUN poetry install --no-root