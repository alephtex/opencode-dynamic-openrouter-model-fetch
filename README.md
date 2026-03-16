# opencode-dynamic-openrouter-model-fetch

An OpenCode plugin that adds a `/dynamic-model-refresh` command to fetch the latest OpenRouter models and update your configuration.

## Features

- **Simple Command**: Just type `/dynamic-model-refresh` in OpenCode
- **Live Terminal Output**: Shows progress and results directly in the terminal
- **Automatic Configuration**: Updates your `opencode.json` with the latest models
- **Capability Detection**: Identifies reasoning and multimodal support

## Installation

### Method 1: Automatic Installation (Recommended)

#### Windows

Double-click `install.bat` or run in Command Prompt:

```cmd
install.bat
```

#### Linux/Mac

Run in terminal:

```bash
chmod +x install.sh
./install.sh
```

### Method 2: Manual Installation

#### Step 1: Copy Plugin Files

**Windows:**

```cmd
mkdir %USERPROFILE%\.config\opencode\plugins\opencode-dynamic-openrouter-model-fetch
xcopy /E /I /Y "dist\*" "%USERPROFILE%\.config\opencode\plugins\opencode-dynamic-openrouter-model-fetch\dist\"
xcopy /E /I /Y "scripts\*" "%USERPROFILE%\.config\opencode\plugins\opencode-dynamic-openrouter-model-fetch\scripts\"
```

**Linux/Mac:**

```bash
mkdir -p ~/.config/opencode/plugins/opencode-dynamic-openrouter-model-fetch
cp -r dist/ ~/.config/opencode/plugins/opencode-dynamic-openrouter-model-fetch/
cp -r scripts/ ~/.config/opencode/plugins/opencode-dynamic-openrouter-model-fetch/
```

#### Step 2: Configure OpenCode

Edit your `opencode.json` (located at `~/.config/opencode/opencode.json` or `%USERPROFILE%\.config\opencode\opencode.json`) and add:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./plugins/opencode-dynamic-openrouter-model-fetch/main.js"]
}
```

### Method 3: Build from Source

1. Clone the repository:

```bash
git clone https://github.com/benjamin-steimer/opencode-dynamic-openrouter-model-fetch.git
cd opencode-dynamic-openrouter-model-fetch
```

2. Build the plugin:

```bash
npm install
npm run build
```

3. Run the installation script (see Method 1).

## Usage

Once installed, simply type in OpenCode:

```
/dynamic-model-refresh
```

The plugin will:

1. **Fetch** all models from OpenRouter API
2. **Detect** reasoning capabilities and multimodal support
3. **Update** your `opencode.json` configuration
4. **Show** progress and results in the terminal

### Example Output

```
🔄 Starting model refresh...
   Fetching models from OpenRouter API...

🔵 Refreshing OpenRouter models...
   API: https://openrouter.ai/api/v1/models
   Config: /home/user/.config/opencode/opencode.json

🔵 Fetched 345 models from OpenRouter
🔵 Formatted 345 models for OpenCode
🔵 Updated 345 models in opencode.json
✅ JSON syntax verified successfully

🟢 Model refresh completed!
   345 OpenRouter models are now available
```

## What It Does

The plugin runs a Python script that:

1. Fetches all available models from OpenRouter API
2. Analyzes each model's capabilities:
   - **Reasoning**: Checks if model supports reasoning
   - **Modalities**: Detects input types (text, image, pdf, audio, video)
3. Filters to OpenCode-supported modalities (text, image, pdf)
4. Updates `opencode.json` with the new model list
5. Validates JSON syntax before writing

## Configuration

After running the command, your `opencode.json` will be updated with entries like:

```json
{
  "provider": {
    "openrouter": {
      "models": {
        "openrouter/xiaomi/mimo-v2-flash": {
          "name": "Xiaomi: MiMo-V2-Flash",
          "reasoning": true
        },
        "openrouter/openai/gpt-5": {
          "name": "OpenAI: GPT-5",
          "reasoning": true,
          "modalities": {
            "input": ["text", "image"],
            "output": ["text"]
          }
        }
      }
    }
  }
}
```

## Requirements

- Python 3.6+
- `requests` library (`pip install requests`)
- Internet connection
- OpenCode with plugin support

## Troubleshooting

### Command not found

- Ensure the plugin is properly installed in `~/.config/opencode/plugins/`
- Verify `opencode.json` includes the plugin path
- Restart OpenCode after installation

### Python script fails

- Check Python is installed: `python --version`
- Install requests library: `pip install requests`
- Verify script path is correct

### Models not updating

- Check internet connection
- Verify OpenRouter API is accessible: `curl https://openrouter.ai/api/v1/models`
- Check file permissions on `opencode.json`

## Repository

https://github.com/benjamin-steimer/opencode-dynamic-openrouter-model-fetch

## License

MIT
