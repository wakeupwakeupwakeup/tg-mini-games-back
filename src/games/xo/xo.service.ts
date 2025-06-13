import { Injectable } from '@nestjs/common';
import {
  GameState,
  PlayerMove,
  Position,
  SquareData,
  WinLine,
} from './xo.types';

@Injectable()
export class XoService {
  private games: Map<string, GameState> = new Map();
  private readonly WINLINE = 5;

  createGame(roomId: string): GameState {
    const initialSquare: SquareData = {
      position: { x: 0, y: 0 },
      hasFigure: false,
      figure: null,
    };

    const gameState: GameState = {
      squares: [initialSquare],
      currentPlayer: 'cross',
      winLine: null,
    };

    this.games.set(roomId, gameState);
    return gameState;
  }

  makeMove(roomId: string, move: PlayerMove): GameState | null {
    const gameState = this.games.get(roomId);
    if (!gameState || gameState.currentPlayer !== move.player) {
      return null;
    }

    const square = gameState.squares.find(
      (s) =>
        s.position.x === move.position.x && s.position.y === move.position.y,
    );

    if (!square || square.hasFigure) {
      return null;
    }

    square.hasFigure = true;
    square.figure = move.player;

    const winLine = this.checkWinLine(
      gameState.squares,
      move.position,
      move.player,
    );
    if (winLine) {
      gameState.winLine = winLine;
    } else {
      this.addNewSquaresAround(gameState.squares, move.position);
      gameState.currentPlayer =
        gameState.currentPlayer === 'cross' ? 'circle' : 'cross';
    }

    return gameState;
  }

  private checkWinLine(
    squares: SquareData[],
    lastMove: Position,
    player: 'cross' | 'circle',
  ): WinLine | null {
    const directions = [
      { dx: 1, dy: 0, type: 'horizontal' },
      { dx: 0, dy: 1, type: 'vertical' },
      { dx: 1, dy: 1, type: 'diagonal' },
      { dx: 1, dy: -1, type: 'antiDiagonal' },
    ];

    for (const dir of directions) {
      let count = 1;
      let start = { ...lastMove };
      let end = { ...lastMove };

      for (let i = 1; i < this.WINLINE; i++) {
        const pos = {
          x: lastMove.x + dir.dx * i,
          y: lastMove.y + dir.dy * i,
        };
        const square = squares.find(
          (s) =>
            s.position.x === pos.x &&
            s.position.y === pos.y &&
            s.figure === player,
        );
        if (square) {
          count++;
          end = pos;
        } else {
          break;
        }
      }

      for (let i = 1; i < this.WINLINE; i++) {
        const pos = {
          x: lastMove.x - dir.dx * i,
          y: lastMove.y - dir.dy * i,
        };
        const square = squares.find(
          (s) =>
            s.position.x === pos.x &&
            s.position.y === pos.y &&
            s.figure === player,
        );
        if (square) {
          count++;
          start = pos;
        } else {
          break;
        }
      }

      if (count >= this.WINLINE) {
        return { start, end, direction: dir.type as WinLine['direction'] };
      }
    }

    return null;
  }

  private addNewSquaresAround(squares: SquareData[], centerPosition: Position) {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        if (x === 0 && y === 0) continue;

        const newPosition = {
          x: centerPosition.x + x,
          y: centerPosition.y + y,
        };

        if (!this.isPositionOccupied(squares, newPosition)) {
          squares.push({
            position: newPosition,
            hasFigure: false,
            figure: null,
          });
        }
      }
    }
  }

  private isPositionOccupied(
    squares: SquareData[],
    position: Position,
  ): boolean {
    return squares.some(
      (square) =>
        square.position.x === position.x && square.position.y === position.y,
    );
  }
}
