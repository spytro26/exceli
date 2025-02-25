"use client"
import { WebSocket } from "ws";
import { useRouter } from "next/navigation";
import { useState , useEffect} from "react";
import { SplashCursor } from "@/components/ui/splash-cursor"



export default function Home() {
  const router = useRouter()
  

  
    function navi(){
  
    router.push("/join")



   

  }


  return (<div className="w-screen h-screen bg-black">
     <SplashCursor />
   beuitify this page then route it to the joining
   <br />
      <button onClick={
        ()=>navi()
      }>Navigate To Join Page</button>
      

  </div>
   
  );
}
