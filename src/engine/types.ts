export interface CharacterData {
  char: string;
  shapeVector: number[];
  brightness: number;
}

export interface KDPoint {
  point: number[];
  char: string;
}

export interface ASCIICell {
  char: string;
  color: string; // hex color like "#ff0000"
}

export interface ASCIIResult {
  grid: ASCIICell[][];
  width: number;
  height: number;
}
