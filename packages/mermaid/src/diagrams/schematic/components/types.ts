export interface ComponentProps {
  x: number;
  y: number;
  rotation?: number; // 0, 90, 180, 270 (degrees)
  label?: string; // Value like "10k"
  name?: string; // ID like "R1"
  size?: number; // Base length, default might be 60 or 100
  color?: string;
  showPinHighlights?: boolean;
}
