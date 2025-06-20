#!/bin/bash

echo "Setting up Ollama with task-master..."
echo "=================================="

echo "Step 1: Checking if Ollama server is running..."
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "Starting Ollama server in background..."
    ollama serve &
    sleep 3
    echo "Ollama server started."
else
    echo "Ollama server is already running."
fi

echo "Step 2: Configuring task-master to use llama3.2..."
npx task-master models --set-main llama3.2 --ollama

echo "Step 3: Verifying configuration..."
npx task-master models

echo "Setup complete! You can now use task-master with Llama 3.2 locally." 