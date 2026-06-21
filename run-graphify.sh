#!/bin/bash

# Ensure script stops if any single step fails
set -e

# Clear any previous hanging model states to free up Codespace RAM
pkill -f ollama || killall ollama llama-server 2>/dev/null || true

# 1. Select the Local LLM Backend
echo "======================================"
echo "   GRAPHIFY PIPELINE AUTOMATOR"
echo "======================================"
echo "Select your local Ollama backend model:"
echo "1) qwen  (Qwen 2.5 Coder 1.5B - Fast/Light)"
echo "2) phi   (Phi 4 Mini 14B - Deep/Detailed)"
echo "3) llama (Llama 3.2 3B - Balanced)"
read -p "Enter choice [1-3]: " model_choice

case $model_choice in
    1) BACKEND="qwen" ;;
    2) BACKEND="phi" ;;
    3) BACKEND="llama" ;;
    *) echo "Invalid choice. Defaulting to qwen."; BACKEND="qwen" ;;
esac

echo -e "\n[+] Using backend: $BACKEND"

# 2. Configure Environment Variables for resource throttling
export OLLAMA_API_KEY="ollama"
export GRAPHIFY_CONCURRENCY=1
export GRAPHIFY_CHUNK_SIZE=1200

# 3. Execute Graphify Pipeline Pass
echo -e "\n[+] Step 1: Running semantic extraction..."
graphify extract . --backend "$BACKEND"

echo -e "\n[+] Step 2: Running clustering and community labeling..."
graphify cluster-only /workspaces/bss --backend "$BACKEND"

# 4. Interactive Viewing Selection
echo -e "\n======================================"
echo "   PIPELINE COMPLETE!"
echo "======================================"
echo "How would you like to view the knowledge graph?"
echo "1) View Markdown Text Report (Inside Editor)"
echo "2) View Interactive Network Map (In Browser via Server)"
echo "3) Exit"
read -p "Enter choice [1-3]: " view_choice

case $view_choice in
    1)
        echo -e "\n[+] Opening GRAPH_REPORT.md in editor panel..."
        code /workspaces/bss/graphify-out/GRAPH_REPORT.md
        ;;
    2)
        echo -e "\n[+] Spinning up preview server on Port 8080..."
        echo "[!] Go to your 'Ports' tab and click Port 8080 once the server starts."
        echo "[!] Press Ctrl+C in this terminal when you are done viewing."
        npx http-server ./graphify-out -p 8080
        ;;
    3)
        echo "Exiting. Your graph outputs are saved in ./graphify-out"
        exit 0
        ;;
    *)
        echo "Invalid selection. Exiting."
        exit 0
        ;;
esac
