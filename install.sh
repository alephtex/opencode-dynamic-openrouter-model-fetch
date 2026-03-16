#!/bin/bash
# Installation script for opencode-dynamic-openrouter-model-fetch plugin

set -e

echo "Installing opencode-dynamic-openrouter-model-fetch plugin..."

# Check if opencode config directory exists
OPCODE_CONFIG_DIR="$HOME/.config/opencode"
if [ ! -d "$OPCODE_CONFIG_DIR" ]; then
    echo "Creating opencode config directory: $OPCODE_CONFIG_DIR"
    mkdir -p "$OPCODE_CONFIG_DIR"
fi

# Check if plugins directory exists
PLUGINS_DIR="$OPCODE_CONFIG_DIR/plugins"
if [ ! -d "$PLUGINS_DIR" ]; then
    echo "Creating plugins directory: $PLUGINS_DIR"
    mkdir -p "$PLUGINS_DIR"
fi

# Create plugin directory
PLUGIN_DIR="$PLUGINS_DIR/opencode-dynamic-openrouter-model-fetch"
echo "Creating plugin directory: $PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR"

# Copy files
echo "Copying plugin files..."
cp -r dist/ "$PLUGIN_DIR/"
cp -r scripts/ "$PLUGIN_DIR/"

# Check if plugin is already in opencode.json
OPCODE_CONFIG="$OPCODE_CONFIG_DIR/opencode.json"
if [ -f "$OPCODE_CONFIG" ]; then
    if grep -q "opencode-dynamic-openrouter-model-fetch" "$OPCODE_CONFIG"; then
        echo "Plugin already configured in opencode.json"
    else
        echo "Adding plugin to opencode.json..."
        # Create a backup
        cp "$OPCODE_CONFIG" "${OPCODE_CONFIG}.backup"
        
        # Update opencode.json
        if command -v jq >/dev/null 2>&1; then
            # Use jq if available
            jq '.plugin += ["./plugins/opencode-dynamic-openrouter-model-fetch/main.js"]' "$OPCODE_CONFIG" > "${OPCODE_CONFIG}.tmp" && mv "${OPCODE_CONFIG}.tmp" "$OPCODE_CONFIG"
        else
            # Manual update for systems without jq
            echo "Warning: jq not found. Please manually add the plugin to opencode.json:"
            echo '  "plugin": ["./plugins/opencode-dynamic-openrouter-model-fetch/main.js"]'
        fi
    fi
else
    echo "Creating new opencode.json with plugin..."
    cat > "$OPCODE_CONFIG" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "./plugins/opencode-dynamic-openrouter-model-fetch/main.js"
  ]
}
EOF
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart OpenCode"
echo "2. Type /dynamic-model-refresh in OpenCode"
echo "3. The plugin will fetch and update your OpenRouter models"
echo ""
echo "To run manually:"
echo "  python \"$PLUGIN_DIR/scripts/refresh.py\""
