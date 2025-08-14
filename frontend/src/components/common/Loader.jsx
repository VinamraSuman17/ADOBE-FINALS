import React, { useState } from "react";
import { MultiStepLoader as Loader } from "../ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

const loadingStates = [
  { text: "Hang Tight!" },
  { text: "Work in progress" },
  { text: "Almost done!" },
];

const MultiStepLoaderDemo = () => {
  const [loading, setLoading] = useState(true); // 👈 start true

  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />

      {/* ❌ Remove the click-to-load button
      <button onClick={() => setLoading(true)} ...>Click to load</button>
      */}

      {loading && (
        <button
          className="fixed top-4 right-4 text-black dark:text-white z-[120]"
          onClick={() => setLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>
  );
};

export default MultiStepLoaderDemo;
