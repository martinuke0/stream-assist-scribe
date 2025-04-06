
# Stream Assist Scribe - Python App

A simple Python application that lets you process text through an OpenAI-compatible API endpoint with streaming responses.

## Features

- Six text processing actions: Explain, Correct, Translate, Summarize, Rewrite, Shorten
- Real-time streaming responses from the API
- Configurable API settings (endpoint, model, API key)
- Simple and clean user interface

## Requirements

- Python 3.6+
- Required packages: tkinter, requests

## Installation

1. Make sure you have Python installed
2. Install the required packages:
   ```
   pip install requests
   ```
   (tkinter is included with most Python installations)

3. Run the application:
   ```
   python app.py
   ```

## Configuration

The app comes with default settings:
- Endpoint: http://localhost:8765/chat/completions
- Model: gpt-3.5-turbo
- API Key: None

You can change these settings by clicking the "⚙️ Settings" button in the app. 
The settings will be saved to a `config.json` file for future use.

## How to Use

1. Enter your text in the input field
2. Click one of the action buttons (Explain, Correct, Translate, etc.)
3. Watch as the response streams in real-time in the output area

## Customization

You can modify the colors and styles in the `configure_styles` method of the `StreamAssistApp` class.
