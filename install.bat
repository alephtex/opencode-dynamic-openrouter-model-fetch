@echo off
REM Installation script for opencode-dynamic-openrouter-model-fetch plugin

echo Installing opencode-dynamic-openrouter-model-fetch plugin...

REM Check if opencode config directory exists
set OPCODE_CONFIG_DIR=%USERPROFILE%\.config\opencode
if not exist "%OPCODE_CONFIG_DIR%" (
    echo Creating opencode config directory: %OPCODE_CONFIG_DIR%
    mkdir "%OPCODE_CONFIG_DIR%"
)

REM Check if plugins directory exists
set PLUGINS_DIR=%OPCODE_CONFIG_DIR%\plugins
if not exist "%PLUGINS_DIR%" (
    echo Creating plugins directory: %PLUGINS_DIR%
    mkdir "%PLUGINS_DIR%"
)

REM Create plugin directory
set PLUGIN_DIR=%PLUGINS_DIR%\opencode-dynamic-openrouter-model-fetch
echo Creating plugin directory: %PLUGIN_DIR%
mkdir "%PLUGIN_DIR%"

REM Copy files
echo Copying plugin files...
xcopy /E /I /Y "dist\*" "%PLUGIN_DIR%\dist\"
xcopy /E /I /Y "scripts\*" "%PLUGIN_DIR%\scripts\"

REM Check if plugin is already in opencode.json
set OPCODE_CONFIG=%OPCODE_CONFIG_DIR%\opencode.json
if exist "%OPCODE_CONFIG%" (
    findstr /C:"opencode-dynamic-openrouter-model-fetch" "%OPCODE_CONFIG%" >nul
    if %errorlevel% equ 0 (
        echo Plugin already configured in opencode.json
    ) else (
        echo Adding plugin to opencode.json...
        echo Please manually add the plugin to %OPCODE_CONFIG%:
        echo   "plugin": ["./plugins/opencode-dynamic-openrouter-model-fetch/main.js"]
    )
) else (
    echo Creating new opencode.json with plugin...
    (
        echo {
        echo   "$schema": "https://opencode.ai/config.json",
        echo   "plugin": [
        echo     "./plugins/opencode-dynamic-openrouter-model-fetch/main.js"
        echo   ]
        echo }
    ) > "%OPCODE_CONFIG%"
)

echo.
echo ✅ Installation complete!
echo.
echo Next steps:
echo 1. Restart OpenCode
echo 2. Type /dynamic-model-refresh in OpenCode
echo 3. The plugin will fetch and update your OpenRouter models
echo.
echo To run manually:
echo   python "%PLUGIN_DIR%\scripts\refresh.py"
