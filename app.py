
import tkinter as tk
from tkinter import scrolledtext, ttk
import threading
import json
import requests
from config import api_config

class StreamAssistApp:
    def __init__(self, root):
        self.root = root
        root.title("Stream Assist Scribe")
        root.geometry("800x600")
        root.configure(bg="#f0f4f8")
        
        # Configure styles
        self.configure_styles()
        
        # Create main frame
        main_frame = ttk.Frame(root, style="Main.TFrame")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Input area
        input_frame = ttk.Frame(main_frame, style="Card.TFrame")
        input_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        ttk.Label(input_frame, text="Enter your text:", style="Title.TLabel").pack(anchor=tk.W, padx=10, pady=5)
        
        self.input_text = scrolledtext.ScrolledText(input_frame, height=8, wrap=tk.WORD)
        self.input_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Action buttons
        actions_frame = ttk.Frame(main_frame)
        actions_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(actions_frame, text="Select an action:", style="Title.TLabel").pack(anchor=tk.W, padx=10, pady=5)
        
        buttons_frame = ttk.Frame(actions_frame)
        buttons_frame.pack(fill=tk.X, padx=10)
        
        actions = [
            {"label": "Explain", "value": "explain", "color": "#3b82f6"},
            {"label": "Correct", "value": "correct", "color": "#10b981"},
            {"label": "Translate", "value": "translate", "color": "#8b5cf6"},
            {"label": "Summarize", "value": "summarize", "color": "#f59e0b"},
            {"label": "Rewrite", "value": "rewrite", "color": "#6366f1"},
            {"label": "Shorten", "value": "shorten", "color": "#ec4899"}
        ]
        
        for idx, action in enumerate(actions):
            btn = ttk.Button(
                buttons_frame, 
                text=action["label"], 
                style=f"Action{idx}.TButton",
                command=lambda a=action["value"]: self.on_action_click(a)
            )
            btn.pack(side=tk.LEFT, padx=5, pady=5)
            
        # Output area
        output_frame = ttk.Frame(main_frame, style="Card.TFrame")
        output_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        ttk.Label(output_frame, text="Response:", style="Title.TLabel").pack(anchor=tk.W, padx=10, pady=5)
        
        self.output_text = scrolledtext.ScrolledText(output_frame, height=10, wrap=tk.WORD, state=tk.DISABLED)
        self.output_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # Status indicator
        self.status_var = tk.StringVar(value="Ready")
        self.status_label = ttk.Label(main_frame, textvariable=self.status_var, style="Status.TLabel")
        self.status_label.pack(anchor=tk.E, padx=10, pady=5)
        
        # Configuration button
        config_btn = ttk.Button(main_frame, text="⚙️ Settings", command=self.open_config_dialog)
        config_btn.pack(anchor=tk.E, padx=10, pady=5)
        
        # Stream state
        self.is_streaming = False
        self.stream_thread = None
        
    def configure_styles(self):
        style = ttk.Style()
        style.configure("Main.TFrame", background="#f0f4f8")
        style.configure("Card.TFrame", background="#ffffff", relief=tk.RAISED)
        style.configure("Title.TLabel", background="#ffffff", font=("Arial", 12, "bold"))
        style.configure("Status.TLabel", font=("Arial", 10))
        
        # Configure button styles with different colors
        colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#6366f1", "#ec4899"]
        for idx, color in enumerate(colors):
            style.configure(f"Action{idx}.TButton", foreground="white", background=color)
    
    def open_config_dialog(self):
        config_window = tk.Toplevel(self.root)
        config_window.title("API Configuration")
        config_window.geometry("400x250")
        config_window.transient(self.root)
        config_window.grab_set()
        
        ttk.Label(config_window, text="API Endpoint:").grid(row=0, column=0, padx=10, pady=10, sticky=tk.W)
        endpoint_entry = ttk.Entry(config_window, width=40)
        endpoint_entry.grid(row=0, column=1, padx=10, pady=10)
        endpoint_entry.insert(0, api_config["endpoint"])
        
        ttk.Label(config_window, text="Model:").grid(row=1, column=0, padx=10, pady=10, sticky=tk.W)
        model_entry = ttk.Entry(config_window, width=40)
        model_entry.grid(row=1, column=1, padx=10, pady=10)
        model_entry.insert(0, api_config["model"])
        
        ttk.Label(config_window, text="API Key:").grid(row=2, column=0, padx=10, pady=10, sticky=tk.W)
        api_key_entry = ttk.Entry(config_window, width=40, show="*")
        api_key_entry.grid(row=2, column=1, padx=10, pady=10)
        if api_config.get("api_key"):
            api_key_entry.insert(0, api_config["api_key"])
        
        def save_config():
            from config import save_config
            new_config = {
                "endpoint": endpoint_entry.get(),
                "model": model_entry.get(),
                "api_key": api_key_entry.get() if api_key_entry.get() else None
            }
            save_config(new_config)
            config_window.destroy()
            
        save_btn = ttk.Button(config_window, text="Save", command=save_config)
        save_btn.grid(row=3, column=1, padx=10, pady=20, sticky=tk.E)
    
    def on_action_click(self, action):
        if self.is_streaming:
            return
            
        input_text = self.input_text.get("1.0", tk.END).strip()
        if not input_text:
            self.status_var.set("Please enter some text first")
            return
            
        self.clear_output()
        self.status_var.set(f"Processing: {action}...")
        self.is_streaming = True
        
        # Start streaming in a separate thread
        self.stream_thread = threading.Thread(
            target=self.stream_response,
            args=(input_text, action)
        )
        self.stream_thread.daemon = True
        self.stream_thread.start()
    
    def stream_response(self, input_text, action):
        try:
            headers = {
                "Content-Type": "application/json"
            }
            
            if api_config.get("api_key"):
                headers["Authorization"] = f"Bearer {api_config['api_key']}"
            
            data = {
                "model": api_config["model"],
                "messages": [
                    {
                        "role": "user",
                        "content": input_text
                    }
                ],
                "stream": True,
                "metadata": {
                    "action": action
                }
            }
            
            response = requests.post(
                api_config["endpoint"],
                headers=headers,
                json=data,
                stream=True
            )
            
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    # Skip "data: " prefix and "[DONE]" message
                    if line.startswith(b"data: "):
                        line = line[6:]
                        if line.strip() == b"[DONE]":
                            continue
                            
                        try:
                            json_line = json.loads(line)
                            content = json_line.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            
                            if content:
                                self.append_to_output(content)
                        except json.JSONDecodeError:
                            continue
            
            self.status_var.set("Ready")
            
        except Exception as e:
            self.status_var.set(f"Error: {str(e)}")
            print(f"Error streaming response: {e}")
        finally:
            self.is_streaming = False
    
    def clear_output(self):
        self.output_text.config(state=tk.NORMAL)
        self.output_text.delete("1.0", tk.END)
        self.output_text.config(state=tk.DISABLED)
    
    def append_to_output(self, text):
        def _append():
            self.output_text.config(state=tk.NORMAL)
            self.output_text.insert(tk.END, text)
            self.output_text.see(tk.END)
            self.output_text.config(state=tk.DISABLED)
        
        # Update UI in the main thread
        self.root.after(0, _append)

if __name__ == "__main__":
    root = tk.Tk()
    app = StreamAssistApp(root)
    root.mainloop()
