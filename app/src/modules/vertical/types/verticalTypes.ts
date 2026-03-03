import { VerticalView } from "@/modules/vertical/types/verticalEndpointsTypes"

export interface VerticalLeftPanelProps {
  verticalCount: number;
  loading: boolean;
  selectedVerticalDescription?: string;
}

export interface VerticalRightPanelProps {
  verticals: VerticalView[];
  loading: boolean;
  hoveredKey: string | null;
  onCardHover: (key: string | null) => void;
  onCardClick: (item: VerticalView) => void;
}