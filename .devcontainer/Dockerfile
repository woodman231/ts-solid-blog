FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Install additional CLI tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    wget \
    redis-tools \
    postgresql-client \
    iputils-ping \
    dnsutils \
    net-tools \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install global node packages
RUN npm install -g typescript ts-node nodemon

WORKDIR /workspace