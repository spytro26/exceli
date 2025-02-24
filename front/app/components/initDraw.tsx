"use client"
import axios from "axios";
import { getWebSocket } from "./ws";

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
}

export async function initDraw(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const roomId = localStorage.getItem("roomId");
  if(!roomId){
    return  ;
  }
  const socket = getWebSocket();

  let existingShapes : Shape[] = await getExistingShapes();

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
    }
    else if (message.type === "erase") {
      // Remove the shape with the matching ID:
      existingShapes = existingShapes.filter(s => s.id !== message.shapeId);
      clearCanvas(existingShapes, canvas, ctx);
    }
  }
  
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

    if (selectedTool === 'rectangle') {
      shape = {    
        id: Date.now().toString(),
        type: "rectangle", 
        x: startX,
        y: startY,
        width: width,
        height: height
      }
    }
    else if (selectedTool === 'circle') {
      // Use a consistent calculation: radius is half the max dimension.
      const radius = Math.max(width, height) / 2;
      shape = {    
        id: Date.now().toString(),
        type: "circle", 
        radius: radius,
        centerX: startX + radius,
        centerY: startY + radius,
      }
    }
    else if (selectedTool === 'line') {
      const startx = startX, starty = startY;
      const endx = e.clientX, endy = e.clientY;
      shape = {
        id: Date.now().toString(),
        type: "line",
        startx,
        starty,
        endx, 
        endy
      }
    }
  
    if (!shape) {
      return; 
    }
    existingShapes.push(shape);


    socket.send(JSON.stringify({
      type: "chat",
      message: JSON.stringify( shape ),
      roomId
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
      }
      else if (selectedTool === 'circle') {
        // Use the same radius calculation as on mouseup.
        const radius = Math.max(width, height) / 2;
        const centerX = startX + radius;
        const centerY = startY + radius;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
      else if (selectedTool === 'line') {
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
    }
    else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
    else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.startx, shape.starty);
      ctx.lineTo(shape.endx, shape.endy);
      ctx.stroke();
    }
  });
}

async function getExistingShapes() {
  const roomId = localStorage.getItem("roomId")
  const res = await axios.post("http://localhost:4040/chats" , {roomId});
  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });

  return shapes;
}
