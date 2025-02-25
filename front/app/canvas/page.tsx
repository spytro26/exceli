"use client";
import { useEffect, useState, useRef } from "react";
import { initDraw } from "../components/initDraw";
import { IconButton } from "./iconButton";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  ALargeSmall,
  EraserIcon,
} from "lucide-react";

export default function Canvas() {
  // State to hold the canvas height
  const [innerHeight, setInnerHeight] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  // Remove this: import { WebSocket } from "ws"; 
  // Use native WebSocket if needed or remove if unused.
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [data, setData] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState("circle");

  // Set canvas height after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      setInnerHeight(window.innerHeight);
    }
  }, []);

  // Update global SelectedTool on client only
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.SelectedTool = selectedTool;
    }
  }, [selectedTool]);

  // Initialize drawing only when the canvas is available
  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current);
    }
  }, [canvasRef]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      {/* Use the computed innerHeight state */}
      <canvas ref={canvasRef} width={4869} height={innerHeight} />
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: any;
  setSelectedTool: (s: any) => void;
}) {
  return (
    <div style={{ position: "fixed", top: 10, left: 550 }}>
      <div className="flex gap-3">
        <IconButton
          activated={selectedTool === "line"}
          icon={<Pencil />}
          onClick={() => {
            setSelectedTool("line");
          }}
        />
        <IconButton
          activated={selectedTool === "rectangle"}
          icon={<RectangleHorizontalIcon />}
          onClick={() => {
            setSelectedTool("rectangle");
          }}
        />
        <IconButton
          activated={selectedTool === "circle"}
          icon={<Circle />}
          onClick={() => {
            setSelectedTool("circle");
          }}
        />
        <IconButton
          activated={selectedTool === "text"}
          icon={<ALargeSmall />}
          onClick={() => {
            setSelectedTool("text");
          }}
        />
        <IconButton
          activated={selectedTool === "erase"}
          icon={<EraserIcon />}
          onClick={() => {
            setSelectedTool("erase");
          }}
        />
      </div>
    </div>
  );
}
