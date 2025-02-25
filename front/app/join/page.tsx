"use client"
import {getWebSocket} from '../components/ws'
import { useRouter } from "next/navigation";
import { useRef,useState, useEffect } from "react"
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles"

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

    const inputbutton  = useRef<HTMLInputElement>(null)
    if(loading){
        return <div>
            <h1>
                WebSocket is connecting
            </h1>

           
        </div>
    }

    return <div className=" h-screen min-w-full  text-lg font-red  text-yellow-500 flex justify-center items-center bg-green-300">
        <div className="  ">
        <h1>enter the room number</h1>
     <input  ref={inputbutton} type="text" >
     </input>
     <br />
     <button onClick={()=>{lungs()}} className="text-blue-700">
        submit
     </button>


 
        </div>
      

    </div>
   
}
