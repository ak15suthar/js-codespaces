FROM node:18-bullseye

# Install basic tools
RUN apt-get update && apt-get install -y \
    git \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g concurrently

# Set working directory
WORKDIR /workspace