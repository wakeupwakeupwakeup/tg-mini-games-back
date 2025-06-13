export interface Position {
  x: number;
  y: number;
}

export interface SquareData {
  position: Position;
  hasFigure: boolean;
  figure: 'cross' | 'circle' | null;
}

export interface GameState {
  squares: SquareData[];
  currentPlayer: 'cross' | 'circle';
  winLine: WinLine | null;
}

export interface WinLine {
  start: Position;
  end: Position;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'antiDiagonal';
}

export interface PlayerMove {
  position: Position;
  player: 'cross' | 'circle';
}
