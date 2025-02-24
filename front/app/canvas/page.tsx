"use client"
import { WebSocket  } from "ws";


import { useEffect, useState , useRef } from "react";
import {initDraw} from "../components/initDraw";
import { IconButton } from "./iconButton";
import { Circle, Pencil, RectangleHorizontalIcon, ALargeSmall, EraserIcon } from "lucide-react";


export default function Canvas(){
    const roomId = localStorage.getItem("roomId");
    const [loading , setloading] = useState<boolean>(false)
    const [socket , setsocket] = useState<WebSocket | null>(null)
    const [data , setData] = useState('');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool , setSelectedTool] = useState("circle");

    useEffect(()=>{
        //@ts-ignore
        window.SelectedTool =selectedTool; 

    },[selectedTool])

    useEffect(() => {

        if (canvasRef.current) {
            initDraw(canvasRef.current);
        }

    }, [canvasRef]);
  

   
    return <div style={{height:"100vh", overflow:"hidden"}}>
        <canvas ref={canvasRef} width={4869} height={window.innerHeight}></canvas>
        <Topbar selectedTool = {selectedTool} setSelectedTool={setSelectedTool} ></Topbar>
    </div>


}   




function Topbar ({selectedTool, setSelectedTool} : {selectedTool : any, setSelectedTool : (s : any)=>void}){
    return  <div style={{position : "fixed" ,top : 10,left : 550 }}>
<div className="flex gap-3">
    <IconButton activated= {selectedTool==='line'} icon={<Pencil/>} onClick={()=>{setSelectedTool("line")}}/>
    <IconButton activated = {selectedTool==='rectangle'} icon={<RectangleHorizontalIcon/>} onClick={()=>{setSelectedTool("rectangle")}}/>
    <IconButton  activated = {selectedTool==='circle'} icon={<Circle/>} onClick={()=>{setSelectedTool("circle")}}/>
    <IconButton  activated = {selectedTool==='text'} icon={<ALargeSmall/>} onClick={()=>{setSelectedTool("text")}}/>
    <IconButton  activated = {selectedTool==='eraser'} icon={<EraserIcon/>} onClick={()=>{setSelectedTool("eraser")}}/>
    </div>
</div>
}   