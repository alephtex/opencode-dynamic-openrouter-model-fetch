#!/usr/bin/env python3
"""
Dynamic OpenRouter Model Refresh Script
Called by the opencode-dynamic-openrouter-model-fetch plugin
"""

import json
import requests
import sys
from pathlib import Path
from datetime import datetime

# OpenRouter API endpoint
OPENROUTER_API = "https://openrouter.ai/api/v1/models"

# Path to opencode config
OPENCODE_CONFIG_PATH = Path.home() / ".config" / "opencode" / "opencode.json"


def fetch_openrouter_models():
    """Fetch all models from OpenRouter API"""
    try:
        response = requests.get(OPENROUTER_API, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching models from OpenRouter: {e}")
        sys.exit(1)


def detect_reasoning_mode(model_data):
    """Detect if model supports reasoning based on supported_parameters"""
    supported = model_data.get("supported_parameters", [])
    return "reasoning" in supported


def detect_input_modalities(model_data):
    """Extract input modalities from model data - OpenCode supported only"""
    architecture = model_data.get("architecture", {})
    input_modalities = architecture.get("input_modalities", ["text"])

    # OpenCode only supports these input modalities
    opencode_supported_input = ["text", "image", "pdf"]

    # Filter to only include OpenCode-supported modalities
    supported_modalities = [
        mod for mod in input_modalities if mod in opencode_supported_input
    ]

    # If no supported modalities found, default to text
    if not supported_modalities:
        supported_modalities = ["text"]

    return supported_modalities


def format_for_opencode(models_data):
    """Format models for opencode.json structure"""
    formatted_models = {}

    for model in models_data.get("data", []):
        model_id = model.get("id")
        if not model_id:
            continue

        # Extract basic info
        name = model.get("name", model_id)
        reasoning = detect_reasoning_mode(model)
        input_modalities = detect_input_modalities(model)

        # Create model entry
        model_entry = {"name": name}

        # Add reasoning capability if supported
        if reasoning:
            model_entry["reasoning"] = True

        # Add modalities in OpenCode format (input/output)
        # OpenCode output is always text
        if input_modalities != ["text"]:
            model_entry["modalities"] = {"input": input_modalities, "output": ["text"]}

        formatted_models[model_id] = model_entry

    return formatted_models


def update_opencode_config(new_models):
    """Update the opencode.json file with new models"""
    try:
        # Read current config
        with open(OPENCODE_CONFIG_PATH, "r") as f:
            config = json.load(f)

        # Update openrouter models
        if "provider" in config and "openrouter" in config["provider"]:
            config["provider"]["openrouter"]["models"] = new_models
        else:
            print("Warning: OpenRouter provider not found in config")
            return False

        # Write updated config
        with open(OPENCODE_CONFIG_PATH, "w") as f:
            json.dump(config, f, indent=2)

        return True

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return False
    except IOError as e:
        print(f"Error reading/writing config: {e}")
        return False


def verify_json_syntax():
    """Verify JSON syntax of the updated file"""
    try:
        with open(OPENCODE_CONFIG_PATH, "r") as f:
            json.load(f)
        return True
    except json.JSONDecodeError as e:
        print(f"JSON syntax verification failed: {e}")
        return False


def main():
    """Main refresh function"""
    print(f"[INFO] Refreshing OpenRouter models...")
    print(f"   API: {OPENROUTER_API}")
    print(f"   Config: {OPENCODE_CONFIG_PATH}")
    print()

    # Fetch models
    models_data = fetch_openrouter_models()
    model_count = len(models_data.get("data", []))
    print(f"[INFO] Fetched {model_count} models from OpenRouter")

    # Format models
    formatted_models = format_for_opencode(models_data)
    print(f"[INFO] Formatted {len(formatted_models)} models for OpenCode")

    # Update config
    if update_opencode_config(formatted_models):
        print(f"[INFO] Updated {len(formatted_models)} models in opencode.json")

        # Verify
        if verify_json_syntax():
            print(f"[OK] JSON syntax verified successfully")
            print()
            print(f"[OK] Model refresh completed!")
            print(f"   {len(formatted_models)} OpenRouter models are now available")
            sys.exit(0)
        else:
            print(f"[ERROR] JSON syntax verification failed")
            sys.exit(1)
    else:
        print(f"[ERROR] Failed to update opencode.json")
        sys.exit(1)


if __name__ == "__main__":
    main()
