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
    <div className="min-h-screen bg-[#05070a] text-[#a0aEC0] font-sans flex items-center justify-center p-4 selection:bg-cyan-500/30">
      <div className="w-full max-w-5xl h-[680px] grid grid-cols-12 bg-[#0a0c10] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-lg">
        
        {/* LEFT PANEL: SCAN & STATS */}
        <div className="col-span-3 p-8 flex flex-col justify-between border-r border-white/5 bg-black/20">
          <div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-cyan-500/50 uppercase mb-8 font-mono">Neural Archive</div>
            <div className="space-y-6">
              <StatItem label="Node cluster" value="NEON-7" />
              <StatItem label="User_X" value={scores.X} color="text-cyan-400 neon-text-cyan" />
              <StatItem label="Matrix_O" value={scores.O} color="text-magenta-400 neon-text-magenta" />
              <StatItem label="Collisions" value={scores.Draw} />
            </div>
          </div>

          <div className="bg-black/40 p-5 border border-white/5 rounded-sm">
            <div className="text-[10px] font-bold tracking-[0.2em] text-cyan-500/30 uppercase mb-2 font-mono">Pulse Monitor</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Phase Sync: Active</div>
            <div className="mt-4 h-1 w-full bg-slate-900 overflow-hidden relative">
              <motion.div 
                initial={{ width: "30%" }}
                animate={{ width: isXNext ? "30%" : "90%" }}
                className={`h-full absolute top-0 left-0 ${isXNext ? 'bg-cyan-500 shadow-[0_0_10px_#00f3ff]' : 'bg-magenta-500 shadow-[0_0_10px_#ff007f]'}`} 
              />
            </div>
            <div className="mt-2 text-[9px] text-slate-500 uppercase font-mono">Kernel Load: 4.2%</div>
          </div>
        </div>

        {/* CENTER PANEL: NEON GRID */}
        <div className="col-span-6 flex flex-col items-center justify-center p-8 bg-[#07090c] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-magenta-500/20 to-transparent" />
          
          <div className="mb-10 text-center relative z-10">
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic">
              NEON<span className="text-cyan-400 neon-text-cyan">GRID</span>
            </h1>
            <div className="inline-flex items-center gap-3 bg-black/60 border border-white/10 text-cyan-400 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
              <span className={`w-2 h-2 rounded-full ${isXNext ? 'bg-cyan-400 neon-glow-cyan animate-pulse' : 'bg-magenta-400 neon-glow-magenta'}`}></span>
              {isXNext ? 'User Intent Detected' : 'Processing Counter-Move'}
            </div>
          </div>

          {/* THE BOARD */}
          <div className="relative">
            <div className="grid grid-cols-3 w-[380px] h-[380px] bg-black/40 border border-white/10 relative z-10 p-2 gap-2 backdrop-blur-md">
              {board.map((square, i) => (
                <Square 
                  key={i} 
                  value={square} 
                  onClick={() => handleSquareClick(i)} 
                  isWinningSquare={winningLine?.includes(i)}
                  disabled={gameOver || !!square || !isXNext}
                />
              ))}
            </div>

            {/* Glowing borders around board */}
            <div className="absolute -inset-1 border border-white/5 pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="mt-12 flex gap-4 relative z-10">
            <button 
              onClick={() => setDifficulty(d => d === 'easy' ? 'hard' : 'easy')}
              className={`px-6 py-2 bg-black/40 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${difficulty === 'hard' ? 'border-cyan-500/50 text-cyan-300 neon-border-cyan' : 'border-white/10 text-slate-500 hover:border-white/20'}`}
            >
              Mode: {difficulty}
            </button>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-white/5 text-white/80 text-[10px] font-bold uppercase tracking-widest border border-white/10 hover:border-cyan-400/50 hover:text-cyan-300 transition-all"
            >
              Purge Cache
            </button>
          </div>

          {/* Overlay for Game Over */}
          <AnimatePresence>
            {gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.4em] mb-2">Operation Terminated</div>
                  <h2 className={`text-4xl font-black uppercase mb-8 tracking-tight ${winner === 'X' ? 'text-cyan-400 neon-text-cyan' : winner === 'O' ? 'text-magenta-400 neon-text-magenta' : 'text-white'}`}>
                    {winner === 'Draw' ? "System Parity" : `${winner} Dominant`}
                  </h2>
                  <button 
                    onClick={resetGame}
                    className="px-10 py-3 bg-cyan-500 text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-cyan-400 neon-glow-cyan transition-all active:scale-95"
                  >
                    Resync Kernel
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL: LOGS & CONFIG */}
        <div className="col-span-3 p-8 flex flex-col border-l border-white/5 bg-black/20">
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-[0.3em] text-cyan-500/50 uppercase mb-6 text-right font-mono">Stream.log</div>
            <div className="space-y-4 font-mono text-[10px] text-slate-500 text-right overflow-hidden">
              {logs.map((log, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={log.includes('X') ? 'text-cyan-400/80' : log.includes('O') ? 'text-magenta-400/80' : 'opacity-60'}
                >
                  {log}
                </motion.div>
              ))}
              <div className="border-t border-white/5 pt-3 opacity-30 italic text-[9px]">Heuristic: Minimax/Alpha-Beta</div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <div className="text-[10px] font-bold tracking-[0.3em] text-cyan-500/50 uppercase mb-8 text-right font-mono">HUD Settings</div>
            <div className="space-y-5">
              <Toggle label="CRT Scan" active={true} />
              <Toggle label="Neural Bias" active={difficulty === 'hard'} />
              <Toggle label="Bloom Ops" active={true} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-slate-300" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{label}</span>
      <span className={`text-2xl font-black tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}

function Toggle({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 opacity-80">
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">{label}</span>
      <div className={`w-8 h-4 ${active ? 'bg-cyan-900/50 border border-cyan-500' : 'bg-slate-900 border border-white/10'} rounded-full flex items-center ${active ? 'justify-end' : 'justify-start'} px-0.5 transition-all`}>
        <motion.div 
          layout
          className={`w-2.5 h-2.5 rounded-full shadow-sm ${active ? 'bg-cyan-400 neon-glow-cyan' : 'bg-slate-700'}`} 
        />
      </div>
    </div>
  );
}


interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare?: boolean;
  disabled?: boolean;
  key?: React.Key;
}

function Square({ value, onClick, isWinningSquare, disabled }: SquareProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative h-full w-full flex items-center justify-center transition-all duration-300 rounded-sm
        ${!value && !disabled ? 'hover:bg-cyan-500/5 cursor-pointer group' : ''}
        ${isWinningSquare ? (value === 'X' ? 'bg-cyan-500/10 neon-border-cyan' : 'bg-magenta-500/10 neon-border-magenta') : 'bg-white/[0.02] border border-white/5'}
      `}
    >
      {/* Hover effect for empty cells */}
      {!value && !disabled && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-1/2 h-1/2 border border-cyan-500/20 rounded-full animate-pulse" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {value === 'X' && (
          <motion.span
            key="X"
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className={`text-6xl font-black tracking-tighter ${isWinningSquare ? 'text-cyan-300 neon-text-cyan' : 'text-cyan-500/80'}`}
          >
            X
          </motion.span>
        )}
        {value === 'O' && (
          <motion.span
            key="O"
            initial={{ scale: 0.5, opacity: 0, rotate: 20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className={`text-6xl font-black tracking-tighter ${isWinningSquare ? 'text-magenta-300 neon-text-magenta' : 'text-magenta-500/80'}`}
          >
            O
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

