/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Player = 'X' | 'O' | null;
export type GameResult = 'X' | 'O' | 'Draw' | null;

export const checkWinner = (board: Player[]): { winner: GameResult; line: number[] | null } => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every(square => square !== null)) {
    return { winner: 'Draw', line: null };
  }

  return { winner: null, line: null };
};

export const minimax = (board: Player[], depth: number, isMaximizing: boolean): number => {
  const { winner } = checkWinner(board);
  
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'Draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            const score = minimax(board, depth + 1, false);
            board[i] = null;
            bestScore = Math.max(score, bestScore);
        }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'X';
            const score = minimax(board, depth + 1, true);
            board[i] = null;
            bestScore = Math.min(score, bestScore);
        }
    }
    return bestScore;
  }
};

export const getBestMove = (board: Player[]): number => {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};
