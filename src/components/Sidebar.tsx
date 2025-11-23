import { useDrag } from "react-dnd";
import {
  Box,
  GitBranch,
  Clock,
  CheckSquare,
  AlertCircle,
  Layers,
  Map as MapIcon,
} from "lucide-react";

const stateTypes = [
  { type: "Task", icon: CheckSquare, label: "Task" },
  { type: "Pass", icon: Box, label: "Pass" },
  { type: "Choice", icon: GitBranch, label: "Choice" },
  { type: "Wait", icon: Clock, label: "Wait" },
  { type: "Fail", icon: AlertCircle, label: "Fail" },
  { type: "Parallel", icon: Layers, label: "Parallel" },
  { type: "Map", icon: MapIcon, label: "Map" },
  { type: "Succeed", icon: CheckSquare, label: "Succeed" },
];

const DraggableState = ({
  type,
  icon: Icon,
  label,
}: {
  type: string;
  icon: any;
  label: string;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "STATE",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-move border border-gray-800/80 bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-950 shadow-[0_10px_25px_rgba(0,0,0,0.55)] hover:border-emerald-500/60 hover:shadow-[0_18px_45px_rgba(16,185,129,0.45)] transition-all duration-200 ${
        isDragging ? "opacity-40 scale-[0.97]" : "opacity-100"
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <Icon size={18} className="text-emerald-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-100">{label}</span>
        <span className="text-[11px] text-gray-500 uppercase tracking-[0.18em]">
          {type}
        </span>
      </div>
      <span className="ml-auto text-[10px] text-gray-500 group-hover:text-emerald-300">
        Drag
      </span>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <div className="w-72 bg-gradient-to-b from-gray-950 via-gray-950/95 to-gray-950 border-r border-gray-800/80 p-4 flex flex-col gap-4 h-full relative z-10 shadow-[18px_0_45px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="section-title mb-1">State Library</p>
          <p className="text-[11px] text-gray-500">
            Drag nodes to compose your workflow.
          </p>
        </div>
        <span className="badge">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />
          Live
        </span>
      </div>

      <div className="flex flex-col gap-3 mt-1 overflow-y-auto pr-1 custom-scrollbar">
        {stateTypes.map((state) => (
          <DraggableState key={state.type} {...state} />
        ))}
      </div>

      <div className="mt-auto panel px-4 py-3 text-[11px] text-gray-400 flex flex-col gap-1.5">
        <p className="font-medium text-gray-200 text-xs">How it works</p>
        <p>
          1. Drag a state to the canvas.
          <br />
          2. Edit transitions and details via JSON.
          <br />
          3. Preview the final Step Function graph.
        </p>
      </div>
    </div>
  );
};
