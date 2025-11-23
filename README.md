# Step Functions Generator

A visual builder for AWS Step Functions (ASL) using React, Zustand, and Monaco Editor.

## Features

- **Drag-and-Drop Interface**: Easily add states to your workflow.
- **Visualizer**: Real-time visualization of the Step Function graph.
- **JSON Editor**: Monaco Editor with syntax highlighting for direct ASL editing.
- **Two-way Synchronization**: Changes in the visual editor update the JSON, and vice-versa.
- **Export**: Download your workflow as a `.asl.json` file.

## Tech Stack

- React
- TypeScript
- Vite
- Zustand (State Management)
- Monaco Editor
- React DnD
- Tailwind CSS
- asl-viewer (Visualization)

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

1.  Drag states from the left sidebar onto the visualizer area (center).
2.  Edit the JSON definition on the right to fine-tune properties.
3.  Click "Export JSON" in the header to save your workflow.

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
