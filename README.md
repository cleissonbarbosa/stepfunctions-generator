# Step Functions Generator

A visual builder for AWS Step Functions (ASL).

## Features

- **Drag-and-Drop Interface**: Easily add states (Task, Choice, Wait, Parallel, etc.) to your workflow.
- **Real-time Visualization**: Powered by `asl-viewer`, rendering your ASL graph instantly.
- **JSON Editor**: Monaco Editor with syntax highlighting for direct ASL editing.
- **Two-way Synchronization**: Changes in the visual editor update the JSON, and vice-versa.
- **Customizable View**:
    - Toggle between **Dark** and **Light** themes for the graph.
    - Switch layout direction (Top-to-Bottom or Left-to-Right).
    - Enable/Disable Minimap and Controls.
- **Export & Share**:
    - Download your workflow as a `.asl.json` file.
    - Copy the ASL JSON to clipboard with one click.
- **Modern UI**: Built with Tailwind CSS v4, featuring glassmorphism and a sleek dark mode interface.

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Zustand** (State Management)
- **Monaco Editor** (Code Editor)
- **React DnD** (Drag and Drop)
- **Tailwind CSS v4** (Styling)
- **asl-viewer** (Visualization Library)
- **Lucide React** (Icons)

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

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
