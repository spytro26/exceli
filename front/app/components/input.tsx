"use client"
import React, { forwardRef } from "react";
import { motion } from "framer-motion";

interface InputProps {
  placeholder?: string;
  onEnter?: (value: string) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ placeholder = "Enter Room No.", onEnter }, ref) => {
  return (
    <div className="relative flex justify-center items-center w-full">
      <motion.input
        type="text"
        ref={ref}
        placeholder={placeholder}
        className="w-full max-w-md p-4 text-xl text-white bg-opacity-10 bg-white border border-gray-500 rounded-xl outline-none backdrop-blur-md 
        focus:border-blue-400 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            onEnter(e.currentTarget.value);
          }
        }}
      />
    </div>
  );
});

export default Input;
