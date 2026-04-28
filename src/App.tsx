/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Circle, RotateCcw, Monitor, User, Trophy } from 'lucide-react';
import { Player, GameResult, checkWinner, getBestMove } from './logic/minimax';

export default function App() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('hard');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<GameResult>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });
  const [logs, setLogs] = useState<string[]>(['[14:02:11] Init: System ready.']);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 5));
  }, []);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
    setWinningLine(null);
    addLog('System rebooted. Grid cleared.');
  }, [addLog]);

  const handleSquareClick = (index: number) => {
    if (board[index] || gameOver || (!isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    addLog(`X placed at Pos(${Math.floor(index/3) + 1},${(index%3) + 1})`);
  };

  // Check for winner
  useEffect(() => {
    const { winner: gameWinner, line } = checkWinner(board);
    if (gameWinner) {
      setGameOver(true);
      setWinner(gameWinner as any);
      setWinningLine(line);
      setScores(prev => ({
        ...prev,
        [gameWinner as string]: prev[gameWinner as keyof typeof prev] + 1
      }));
      addLog(`Match end: ${gameWinner} result recorded.`);
    }
  }, [board, addLog]);

  // AI Move
  useEffect(() => {
    if (!isXNext && !gameOver) {
      addLog('CPU calculating optimal path...');
      const timeoutId = setTimeout(() => {
        const newBoard = [...board];
        let moveIndex: number;

        if (difficulty === 'hard') {
          moveIndex = getBestMove(newBoard);
        } else {
          const availableMoves = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
          moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        if (moveIndex !== -1) {
          newBoard[moveIndex] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          addLog(`O placed at Pos(${Math.floor(moveIndex/3) + 1},${(moveIndex%3) + 1})`);
        }
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [isXNext, gameOver, board, difficulty, addLog]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[680px] grid grid-cols-12 bg-white border border-slate-200 shadow-2xl overflow-hidden rounded-sm">
        
        {/* LEFT PANEL: SCORE & STATS */}
        <div className="col-span-3 p-8 flex flex-col justify-between border-r border-slate-200 bg-slate-50/50">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-8">Match Archive</div>
            <div className="space-y-6">
              <StatItem label="Session ID" value="#VX-BOARD" />
              <StatItem label="Player (X)" value={scores.X} color="text-indigo-600" />
              <StatItem label="CPU (O)" value={scores.O} color="text-rose-600" />
              <StatItem label="Stalemates" value={scores.Draw} />
            </div>
          </div>

          <div className="bg-white p-5 border border-slate-200 shadow-sm">
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Neural Engine</div>
            <div className="text-xs font-bold uppercase tracking-tight">Active Matrix Processing</div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 overflow-hidden">
              <motion.div 
                initial={{ width: "30%" }}
                animate={{ width: isXNext ? "30%" : "85%" }}
                className="h-full bg-indigo-500" 
              />
            </div>
            <div className="mt-2 text-[9px] text-slate-400 uppercase">Latency: 12ms / Stable</div>
          </div>
        </div>

        {/* CENTER PANEL: GAME BOARD */}
        <div className="col-span-6 flex flex-col items-center justify-center p-8 bg-white relative">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">
              OXO<span className="text-indigo-600 underline decoration-4 underline-offset-4">GRID</span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              <span className={`w-1.5 h-1.5 rounded-full ${isXNext ? 'bg-indigo-400 animate-pulse' : 'bg-rose-400'}`}></span>
              Current Phase: {isXNext ? 'User' : 'Matrix'}
            </div>
          </div>

          {/* THE BOARD */}
          <div className="relative">
            <div className="grid grid-cols-3 w-[360px] h-[360px] border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(226,232,240,1)] bg-white relative z-10">
              {board.map((square, i) => (
                <Square 
                  key={i} 
                  value={square} 
                  index={i}
                  onClick={() => handleSquareClick(i)} 
                  isWinningSquare={winningLine?.includes(i)}
                  disabled={gameOver || !!square || !isXNext}
                />
              ))}
            </div>

            {/* Win/Draw Overlay */}
            <AnimatePresence>
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Status Report</div>
                    <h2 className="text-3xl font-black uppercase text-slate-900 mb-6 tracking-tighter">
                      {winner === 'Draw' ? "Conflict Draw" : `${winner} Dominant`}
                    </h2>
                    <button 
                      onClick={resetGame}
                      className="px-8 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all active:translate-y-0.5"
                    >
                      Initialize Reboot
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={() => setDifficulty(d => d === 'easy' ? 'hard' : 'easy')}
              className="px-6 py-2 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:border-slate-900 transition-colors"
            >
              Mode: {difficulty}
            </button>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:border-slate-900 transition-colors"
            >
              Flush Cache
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LOGS & CONFIG */}
        <div className="col-span-3 p-8 flex flex-col border-l border-slate-200 bg-slate-50/50">
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4 text-right">Computation Log</div>
            <div className="space-y-4 font-mono text-[10px] text-slate-500 text-right">
              {logs.map((log, idx) => (
                <div key={idx} className={log.includes('X') ? 'text-indigo-500' : log.includes('O') ? 'text-rose-500' : ''}>
                  {log}
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 opacity-50 italic text-[9px]">Alpha-Beta Pruning 2.0</div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-6 text-right">Matrix Config</div>
            <div className="space-y-4">
              <Toggle label="Direct Render" active={true} />
              <Toggle label="Heuristic Bias" active={difficulty === 'hard'} />
              <Toggle label="Low Latency" active={true} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-slate-900" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-200 pb-2">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">{label}</span>
      <span className={`text-xl font-black tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}

function Toggle({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 grayscale opacity-60">
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      <div className={`w-8 h-4 ${active ? 'bg-emerald-500' : 'bg-slate-300'} rounded-full flex items-center ${active ? 'justify-end' : 'justify-start'} px-0.5`}>
        <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
      </div>
    </div>
  );
}

interface SquareProps {
  value: Player;
  onClick: () => void;
  index: number;
  isWinningSquare?: boolean;
  disabled?: boolean;
  key?: React.Key;
}

function Square({ value, onClick, index, isWinningSquare, disabled }: SquareProps) {
  const isRightEdge = (index + 1) % 3 === 0;
  const isBottomEdge = index >= 6;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative h-full w-full flex items-center justify-center transition-colors
        ${!isRightEdge ? 'border-r-2 border-slate-900' : ''}
        ${!isBottomEdge ? 'border-b-2 border-slate-900' : ''}
        ${!value && !disabled ? 'hover:bg-slate-50' : ''}
        ${isWinningSquare ? 'bg-indigo-50/50' : ''}
      `}
    >
      <AnimatePresence mode="wait">
        {value === 'X' && (
          <motion.span
            key="X"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-black text-indigo-600 tracking-tighter"
          >
            X
          </motion.span>
        )}
        {value === 'O' && (
          <motion.span
            key="O"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-black text-rose-600 tracking-tighter"
          >
            O
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

