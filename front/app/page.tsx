"use client"
import { WebSocket } from "ws";
import { useRouter } from "next/navigation";
import { useState , useEffect} from "react";



export default function Home() {
  const router = useRouter()
  

  
    function navi(){
  
    router.push("/join")

  



   

  }


  return (<div>
   beuitify this page then route it to the joining
   <br />
      <button onClick={
        ()=>navi()
      }>Navigate To Join Page</button>
      

  </div>
   
  );
}
