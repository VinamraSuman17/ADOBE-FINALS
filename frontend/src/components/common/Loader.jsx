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
    </div>
  );
};

export default MultiStepLoaderDemo;
