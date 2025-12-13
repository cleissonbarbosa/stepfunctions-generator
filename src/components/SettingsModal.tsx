import { X, Layout, Monitor, Eye, Moon, Sun } from "lucide-react";
import { useStore } from "../store/useStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { viewSettings, updateViewSettings } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
          <h3 className="font-semibold text-white">View Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Moon size={14} />
              Graph Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateViewSettings({ graphTheme: "dark" })}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  viewSettings.graphTheme === "dark"
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                onClick={() => updateViewSettings({ graphTheme: "light" })}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  viewSettings.graphTheme === "light"
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                }`}
              >
                <Sun size={16} />
                Light
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Monitor size={14} />
              Interface
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-200">Show Minimap</span>
                </div>
                <input
                  type="checkbox"
                  checked={viewSettings.showMinimap}
                  onChange={(e) =>
                    updateViewSettings({ showMinimap: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Layout size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-200">Show Controls</span>
                </div>
                <input
                  type="checkbox"
                  checked={viewSettings.showControls}
                  onChange={(e) =>
                    updateViewSettings({ showControls: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Layout size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-200">Show Toolbar</span>
                </div>
                <input
                  type="checkbox"
                  checked={viewSettings.showToolbar}
                  onChange={(e) =>
                    updateViewSettings({ showToolbar: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
