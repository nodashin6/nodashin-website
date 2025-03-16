FROM node:22.12.0

WORKDIR /app/website

COPY package*.json ./

RUN npm install

# Install dependencies for pyenv and Python
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    wget \
    llvm \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libffi-dev \
    liblzma-dev \
    python3-openssl \
    git

# Install pyenv
RUN git clone https://github.com/pyenv/pyenv.git ~/.pyenv

# Set pyenv environment variables
ENV PYENV_ROOT="/root/.pyenv"
ENV PATH="$PYENV_ROOT/bin:$PYENV_ROOT/shims:$PYENV_ROOT/bin:$PATH"

# Initialize pyenv for every shell session
RUN echo 'eval "$(pyenv init --path)"' >> ~/.bashrc && \
    echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# Install Python 3.12.4 and set it as global
RUN /bin/bash -c "source ~/.bashrc && pyenv install 3.12.4 && pyenv global 3.12.4"

# Create a virtual environment
RUN /bin/bash -c "source ~/.bashrc && pyenv global 3.12.4 && python -m venv /app/website/.venv"

COPY requirements.txt .

# Activate the virtual environment and install dependencies
RUN /bin/bash -c "source ~/.bashrc && source /app/website/.venv/bin/activate && pip install -r requirements.txt"

ENV VIRTUAL_ENV=/app/website/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"