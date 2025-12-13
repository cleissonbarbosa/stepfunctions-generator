# Step Functions Generator

A visual builder for AWS Step Functions (ASL).

## Features

- **Drag-and-Drop Interface**: Easily add states (Task, Choice, Wait, Parallel, etc.) to your workflow.
- **Real-time Visualization**: Powered by `asl-viewer`, rendering your ASL graph instantly.
- **JSON Editor**: Monaco Editor with syntax highlighting for direct ASL editing.
- **ASL Semantic Validation**: Detects broken references, missing transitions, unreachable states, and more.
- **Undo/Redo**: Time-travel editing for committed (valid) workflows.
- **Autosave (Local)**: Persists your workflow and view settings in the browser.
- **Inline Errors**: Validation issues are highlighted directly in the Monaco editor.
- **Two-way Synchronization**: Changes in the visual editor update the JSON, and vice-versa.
- **Customizable View**:
    - Toggle between **Dark** and **Light** themes for the graph.
    - Switch layout direction (Top-to-Bottom or Left-to-Right).
    - Enable/Disable Minimap and Controls.
- **Export & Share**:
    - Download your workflow as a `.asl.json` file.
    - Import a workflow from a `.json` file.
    - Copy the ASL JSON to clipboard with one click.
- **Modern UI**: Built with Tailwind CSS v4, featuring glassmorphism and a sleek dark mode interface.

## Getting Started

1.  Install dependencies:
    ```bash
    yarn install
    ```

2.  Start the development server:
    ```bash
    yarn dev
    ```

3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1.  **Drag & Drop**: Drag states from the left "State Library" sidebar onto the visualizer area.
2.  **Edit JSON**: Use the right-hand editor to fine-tune properties (Resource ARNs, Choice rules, etc.).
3.  **Customize View**: Click the **Settings** (gear icon) in the header to adjust the graph layout and theme.
4.  **Export**: Click "Export JSON" to save your file, or the **Share** icon to copy the code.

## License

MIT