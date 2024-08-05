"use client";

import React from "react";

interface DividerProps {
  text: string;
}

const Divider: React.FC<DividerProps> = ({ text }) => {
  return (
    <div className="my-4 flex items-center">
      <div className="h-0.5 flex-grow bg-gray-300"></div>
      <span className="px-4 text-2xl">{text}</span>
      <div className="h-0.5 flex-grow bg-gray-300"></div>
    </div>
  );
};

export default Divider;
