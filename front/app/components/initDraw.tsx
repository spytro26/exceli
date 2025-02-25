"use client"
import axios from "axios";
import { getWebSocket } from "./ws";

// Update Shape type to include "text"
type Shape = {
  id: string,
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
} | {
  id: string, 
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
} | {
  id: string, 
  type: "line",
  startx: number,
  starty: number, 
  endx: number, 
  endy: number
} | {
  id: string,
  type: "text",
  x: number,
  y: number,
  text: string,
}

export async function initDraw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const roomId = localStorage.getItem("roomId");
  if (!roomId) {
    return;
  }
  const socket = getWebSocket();
  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        type: "join",
        roomId: roomId,
      })
    );
  };

  let existingShapes: Shape[] = await getExistingShapes();

  console.log(existingShapes);

  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape);
      clearCanvas(existingShapes, canvas, ctx);
    } else if (message.type === "erase") {
      // Remove the shape with the matching ID:
      existingShapes = existingShapes.filter(s => s.id !== message.shapeId);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);
  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    //@ts-ignore
    const selectedTool = window.SelectedTool;
    let shape: Shape | null = null;
    if (selectedTool === "text") {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Call text input overlay function
      createTextInput(x, y, canvas, socket, roomId);
      return;
    }
    if (selectedTool === 'rectangle') {
      shape = {
        id: Date.now().toString(),
        type: "rectangle",
        x: startX,
        y: startY,
        width: width,
        height: height,
      };
    } else if (selectedTool === 'circle') {
      const radius = Math.max(width, height) / 2;
      shape = {
        id: Date.now().toString(),
        type: "circle",
        radius: radius,
        centerX: startX + radius,
        centerY: startY + radius,
      };
    } else if (selectedTool === 'line') {
      const startx = startX, starty = startY;
      const endx = e.clientX, endy = e.clientY;
      shape = {
        id: Date.now().toString(),
        type: "line",
        startx,
        starty,
        endx,
        endy,
      };
    }
  
    if (!shape) {
      return;
    }
    existingShapes.push(shape);
    socket.send(JSON.stringify({
      type: "chat",
      message: JSON.stringify(shape),
      roomId,
    }));
  });

  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      //@ts-ignore
      const selectedTool = window.SelectedTool;
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255, 255, 255)";
      if (selectedTool === 'rectangle') {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool === 'circle') {
        const radius = Math.abs(Math.max(width, height) / 2);
        const centerX = Math.abs(startX + radius);
        const centerY = Math.abs(startY + radius);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      } else if (selectedTool === 'line') {
        const startx = startX, starty = startY;
        const endx = e.clientX, endy = e.clientY;
        ctx.beginPath();
        ctx.moveTo(startx, starty);
        ctx.lineTo(endx, endy);
        ctx.stroke();
      }
    }
  });
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  existingShapes.forEach((shape) => {
    if (shape.type === "rectangle") {
      ctx.strokeStyle = "rgba(255, 255, 255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(Math.abs(shape.centerX), Math.abs(shape.centerY), Math.abs(shape.radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.startx, shape.starty);
      ctx.lineTo(shape.endx, shape.endy);
      ctx.stroke();
    } else if (shape.type === "text") {
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(shape.text, shape.x, shape.y);
    }
  });
}

async function getExistingShapes() {
  const roomId = localStorage.getItem("roomId");
  const res = await axios.post("http://localhost:4040/chats", { roomId });
  const messages = res.data.messages;
  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });
  return shapes;
}

function createTextInput(
  x: number,
  y: number,
  canvas: HTMLCanvasElement,
  socket: WebSocket,
  roomId: string
) {
  const input = document.createElement("input");
  input.type = "text";
  input.style.position = "absolute";
  const canvasRect = canvas.getBoundingClientRect();
  input.style.left = `${canvasRect.left + x}px`;
  input.style.top = `${canvasRect.top + y - 16}px`;
  input.style.fontSize = "16px";
  input.style.fontWeight = "bold";
  input.style.color = "white";
  input.style.background = "transparent";
  input.style.border = "none";
  input.style.outline = "none";
  input.style.zIndex = "1000";
  document.body.appendChild(input);
  input.focus();
  let removed = false;
  const removeInput = () => {
    if (!removed && document.body.contains(input)) {
      document.body.removeChild(input);
      removed = true;
    }
  };
 // Define the blur handler as a separate function.
 const onBlur = () => {
  removeInput();
};

input.addEventListener("blur", onBlur);



  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = input.value;
      input.removeEventListener("blur", onBlur);
      removeInput();
  
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(text, x, y);
      }
      const textShape = {
        id: Date.now().toString(),
        type: "text",
        x,
        y,
        text,
      };
      socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify(textShape),
          roomId,
        })
      );
    }
  });
 
}
