
import json
import os

# Default configuration
DEFAULT_CONFIG = {
    "endpoint": "http://localhost:8765/chat/completions",
    "model": "gpt-3.5-turbo",
    "api_key": None
}

# Path to the configuration file
CONFIG_FILE = "config.json"

# Initialize configuration
api_config = DEFAULT_CONFIG.copy()

# Load configuration from file if it exists
def load_config():
    global api_config
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                loaded_config = json.load(f)
                api_config.update(loaded_config)
        except Exception as e:
            print(f"Error loading configuration: {e}")

# Save configuration to file
def save_config(new_config):
    global api_config
    api_config.update(new_config)
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(api_config, f, indent=4)
        print("Configuration saved successfully")
    except Exception as e:
        print(f"Error saving configuration: {e}")

# Load config at startup
load_config()
