
import React, { useState, useEffect, useCallback } from 'react';
import { useKeyPress } from '../hooks/useKeyPress';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const CONTRIBUTION_LEVELS = [4, 4, 4, 4, 3, 3, 3, 2, 2, 1];

const GitSnake = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [grid, setGrid] = useState<number[][]>(() => {
    const newGrid = Array(GRID_SIZE).fill(0).map(() => 
      Array(GRID_SIZE).fill(0).map(() => 
        CONTRIBUTION_LEVELS[Math.floor(Math.random() * CONTRIBUTION_LEVELS.length)]
      )
    );
    return newGrid;
  });
  
  const getContributionColor = (level: number) => {
    switch(level) {
      case 4: return 'bg-[#216e39]';
      case 3: return 'bg-[#30a14e]';
      case 2: return 'bg-[#40c463]';
      case 1: return 'bg-[#9be9a8]';
      default: return 'bg-[#ebedf0]';
    }
  };

  const checkCollision = (head: Position, snakeBody: Position[]) => {
    return snakeBody.some((segment, index) => {
      // Skip checking the head (first segment)
      if (index === 0) return false;
      return segment.x === head.x && segment.y === head.y;
    });
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch(direction) {
        case 'UP': head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE; break;
        case 'DOWN': head.y = (head.y + 1) % GRID_SIZE; break;
        case 'LEFT': head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE; break;
        case 'RIGHT': head.x = (head.x + 1) % GRID_SIZE; break;
      }

      // Check for self-collision
      if (checkCollision(head, prevSnake)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];
      
      // Eat contribution
      if (grid[head.y][head.x] > 0) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[head.y] = [...newGrid[head.y]];
          newGrid[head.y][head.x] = Math.max(0, newGrid[head.y][head.x] - 2);
          return newGrid;
        });
        setScore(prev => prev + 2);
      } else {
        // Remove tail only if we didn't eat
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, grid, gameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 200);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useKeyPress('ArrowUp', () => !gameOver && setDirection('UP'));
  useKeyPress('ArrowDown', () => !gameOver && setDirection('DOWN'));
  useKeyPress('ArrowLeft', () => !gameOver && setDirection('LEFT'));
  useKeyPress('ArrowRight', () => !gameOver && setDirection('RIGHT'));
  useKeyPress('Enter', () => {
    if (gameOver) {
      setSnake(INITIAL_SNAKE);
      setDirection('RIGHT');
      setScore(0);
      setGameOver(false);
      setGrid(Array(GRID_SIZE).fill(0).map(() => 
        Array(GRID_SIZE).fill(0).map(() => 
          CONTRIBUTION_LEVELS[Math.floor(Math.random() * CONTRIBUTION_LEVELS.length)]
        )
      ));
    }
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-500 mb-4">GitHub Snake</h1>
        <div className="flex items-center justify-center gap-4 text-white mb-4">
          <div className="flex items-center gap-2">
            <ArrowUp size={24} />
            <ArrowDown size={24} />
            <ArrowLeft size={24} />
            <ArrowRight size={24} />
          </div>
          <span>Use as setas para mover</span>
        </div>
        <div className="text-2xl text-green-500 mb-4">Pontuação: {score}</div>
        {gameOver && (
          <div className="text-red-500 mb-4">
            Game Over! Pressione Enter para recomeçar
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={cn(
                  "w-5 h-5 rounded-sm transition-colors duration-200",
                  getContributionColor(cell),
                  snake.some(pos => pos.x === x && pos.y === y) && "bg-white"
                )}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GitSnake;
