"use client"
import {getWebSocket} from '../components/ws'
import { useRouter } from "next/navigation";
import { useRef,useState, useEffect } from "react"
import React from "react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";


export default  function Joining(){
    const router = useRouter()
    const [socket, setsocket] = useState<WebSocket| null>(null);
    const [loading , setloading]  = useState<boolean>();
     const [clicked , setClicked] = useState(false);


  useEffect(()=>{
    setloading(true)
    if(!socket){
        const ws = getWebSocket()
     

        setsocket(ws);

    }
    
   
    setloading(false);
    function next (){
        if(!loading && clicked){
            router.push("/canvas")
        }
    }
    
},[clicked ])

  function lungs(){
    setClicked(true);
        if(inputbutton.current?.value){
        const roomId : string   = inputbutton.current?.value;
        if(!roomId){
            console.log("lung room hil nahi hai aa ")
            return 
        }
        localStorage.setItem("roomId" , roomId);
      
        socket?.send(JSON.stringify({type  : "join" , roomId : roomId}))


       if(loading===false){
        router.push("/canvas")

       }
      
        
        


        } 
    }
   function   handleKeyPress(event : any){
        if(event.key==='Enter'){
        lungs();

             }

    }

    const inputbutton  = useRef<HTMLInputElement>(null)
    if(loading){
        return <div>
            <h1>
                WebSocket is connecting
            </h1>

           
        </div>
    }
    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <HeroGeometric 
            badge="Sketch Sync"
            title1="Draw Collaborate"
            title2="Ideate Create"
          />
         <div className="absolute top-[470px] flex flex-col items-center space-y-3">
      <input
       
       onKeyDown={handleKeyPress}
        type="text" 
        ref={inputbutton}
        placeholder="Enter Room Number"
        className="w-[250px] px-4 py-2 text-lg rounded-lg border border-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      />
      <button 
        onClick={() => lungs()} 
        className="w-[250px] px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
      >
        Join Room
      </button>
    </div>
    
         
        </div>
      );
   
}
