import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "./components/Sidebar";
import { JsonEditor } from "./components/JsonEditor";
import { Visualizer } from "./components/Visualizer";
import { Header } from "./components/Header";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Draggable States */}
          <Sidebar />

          {/* Center - Visualizer */}
          <div className="flex-1 relative">
            <Visualizer />
          </div>

          {/* Right - JSON Editor */}
          <div className="w-[400px]">
            <JsonEditor />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
