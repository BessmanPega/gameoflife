import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, Text } from '@pega/cosmos-react-core';

// Neighbor coordinate offsets (8 surrounding cells)
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

export default function GameOfLifeWidget(props) {
  // getPConnect is injected by Constellation framework
  const { getPConnect, label = "Conway's Game of Life", rows = 30, cols = 30 } = props;

  // Enforce minimum and sensible default limits
  const numRows = parseInt(rows, 10) || 30;
  const numCols = parseInt(cols, 10) || 30;

  // Initialize a blank grid
  const createEmptyGrid = useCallback(() => {
    return Array.from({ length: numRows }).map(() => Array.from({ length: numCols }).fill(0));
  }, [numRows, numCols]);

  const [grid, setGrid] = useState(createEmptyGrid);
  const [running, setRunning] = useState(false);

  // We use refs to safely access the latest state of "running" within the recursive interval
  const runningRef = useRef(running);
  runningRef.current = running;

  // NEW: React to rows/cols changes from App Studio or Storybook
  useEffect(() => {
    setGrid(createEmptyGrid());
    setRunning(false); // Stop simulation if grid changes size
  }, [createEmptyGrid]);

  // Core simulation engine
  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    setGrid(g => {
      // Create deep clone of the current grid to avoid direct mutation
      const nextGrid = g.map(arr => [...arr]);

      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          let neighbors = 0;

          operations.forEach(([x, y]) => {
            const newI = i + x;
            const newJ = j + y;
            // Check bounds
            if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
              neighbors += g[newI][newJ];
            }
          });

          // Game of Life Rules:
          // 1. Underpopulation (< 2) or Overpopulation (> 3) = death
          if (neighbors < 2 || neighbors > 3) {
            nextGrid[i][j] = 0;
          }
          // 2. Reproduction (exactly 3) = life
          else if (g[i][j] === 0 && neighbors === 3) {
            nextGrid[i][j] = 1;
          }
          // 3. Survival (2 or 3) = maintains state (no change needed)
        }
      }
      return nextGrid;
    });

    setTimeout(runSimulation, 100);
  }, [numRows, numCols]);

  const handleStartStop = () => {
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      runSimulation();
    }
  };

  const handleClear = () => {
    setGrid(createEmptyGrid());
    setRunning(false);
  };

  const handleRandomize = () => {
    const randomGrid = Array.from({ length: numRows }).map(() =>
      Array.from({ length: numCols }).map(() => (Math.random() > 0.7 ? 1 : 0))
    );
    setGrid(randomGrid);
  };

  const toggleCell = (i, k) => {
    if (running) return; // Prevent painting while running to avoid rapid mutation race conditions
    const newGrid = grid.map(arr => [...arr]);
    newGrid[i][k] = grid[i][k] ? 0 : 1;
    setGrid(newGrid);
  };

  return (
    <div
      style={{
        padding: '16px',
        background: 'var(--app-background-color, #FFF)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <Text variant='h2' as='h2' style={{ marginBottom: '16px' }}>
        {label}
      </Text>

      <Flex gap={2} style={{ marginBottom: '16px' }}>
        <Button variant='primary' onClick={handleStartStop}>
          {running ? 'Stop' : 'Start'}
        </Button>
        <Button variant='secondary' onClick={handleClear}>
          Clear
        </Button>
        <Button variant='secondary' onClick={handleRandomize}>
          Randomize
        </Button>
      </Flex>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 20px)`,
          gap: '1px',
          backgroundColor: '#e1e1e1',
          width: 'max-content',
          border: '1px solid #ccc'
        }}
      >
        {grid.map((rowArr, i) =>
          rowArr.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => toggleCell(i, k)}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? 'var(--app-primary-color, #2563EB)' : '#FFF',
                cursor: running ? 'default' : 'pointer',
                transition: 'background-color 0.1s ease-in-out'
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

GameOfLifeWidget.propTypes = {
  getPConnect: PropTypes.func.isRequired,
  label: PropTypes.string,
  rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cols: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
