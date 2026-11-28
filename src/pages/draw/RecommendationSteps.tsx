import { useState, type Dispatch, type SetStateAction } from "react";
import { Outlet, useLocation } from "react-router-dom";

export interface RecommendationStepsContext {
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
}

export default function RecommendationSteps() {
  const { state } = useLocation();
  const [selectedTags, setSelectedTags] = useState<string[]>(
    state?.selectedTags ?? [],
  );
  const context: RecommendationStepsContext = { selectedTags, setSelectedTags };

  return <Outlet context={context} />;
}
