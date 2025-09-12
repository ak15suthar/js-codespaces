import React from "react";

function FilterButton({ text, onClick, active }) {
  return (
    <button
      className={`px-4 py-2 rounded-full font-semibold border transition-all ${
        active ? "bg-green-600 text-white" : "bg-white text-black border-black"
      }`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default FilterButton;
