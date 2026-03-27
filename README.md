# Conway's Game of Life

https://github.com/user-attachments/assets/39281ae4-f2e1-45d3-99ec-0056ff22e771

This is a mostly vibe-coded experiment, inspired by [Richard Marsot's work](https://www.linkedin.com/posts/richard-marsot-266929_building-a-constellation-dx-component-has-share-7443079944269651968-FyZZ?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAETwqEBtGeQvyHzwHwOdEL6oqNxRBtnijE). I started by asking Gemini 3.1 pro the following:

```
Generate a custom Constellation DX Component that implements Conway's Game of Life, as defined here: Conway's Game of Life - Wikipedia

Use these resources to help write parsimonious and performant code:

* Components in the Constellation Design System: Constellation front-end and low-code development | Pega Constellation design system

* Examples of custom Constellation DX Components: constellation-ui-gallery/src/components at master · pegasystems/constellation-ui-gallery · GitHub

* Documentation for the API's used to build Constellation DX Components: Using PCore and PConnect public APIs

* Technical information about Constellation DX Component development: Constellation DX components
```

It came back with a pretty good plan.

## Gemini's build plan

To create a custom Constellation DX Component that implements Conway's Game of Life, we should structure this as a **Widget** component. Widgets are ideal for self-contained functionality and interactive logic.

Below is a complete guide and the code required to build an efficient, parsimonious Game of Life component that conforms to Pega Constellation standards.

### 1. Initialize the Component

Assuming you have initialized your Constellation DX Component project using the command line (`npx @pega/custom-dx-components init`), you will create a new Widget component.

Run the following command from your project root:

```bash
npm run create
```

When prompted:

- **Type:** `Widget`
- **Subtype:** `GameOfLife` (or any custom name)
- **Name:** `GameOfLifeWidget`

### 2. Define `config.json`

Once scaffolded, update the component’s `config.json` file. We will expose `label`, `rows`, and `cols` so App Studio authors can configure the initial grid size and widget title without editing code.

```json
{
  "name": "GameOfLifeWidget",
  "label": "Game Of Life",
  "description": "An implementation of Conway's Game of Life",
  "componentType": "Widget",
  "properties": [
    {
      "name": "label",
      "label": "Widget Label",
      "format": "TEXT",
      "type": "Property"
    },
    {
      "name": "rows",
      "label": "Number of Rows",
      "format": "INTEGER",
      "type": "Property"
    },
    {
      "name": "cols",
      "label": "Number of Columns",
      "format": "INTEGER",
      "type": "Property"
    }
  ]
}
```

### 3. Implement the React Component (`index.jsx` / `index.tsx`)

This implementation relies heavily on React Hooks (`useState`, `useCallback`, `useRef`) for optimal performance, and it ensures we do not trigger unnecessary renders. The grid state uses a 2D array, and the `useRef` hook is leveraged to manage the interval timer so we don't have to break React's dependency closures during the simulation.

Replace the contents of `src/components/GameOfLifeWidget/index.jsx` with the following:

```jsx
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
        {grid.map((rows, i) =>
          rows.map((col, k) => (
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
```

### Component Design Highlights

1. **Pega UI Consistency:** The UI makes use of `@pega/cosmos-react-core` (`Button`, `Flex`, `Text`) to ensure it seamlessly inherits Constellation styling variables (fonts, rounding, border styles) from the main host application.
2. **Double-Buffering & Mutation:** To keep memory usage low, the simulation performs a shallow slice of outer arrays but copies the internal arrays before mapping neighbor combinations.
3. **App Studio Readiness:** Both `cols` and `rows` values are dynamically mapped via `config.json`, meaning App Studio authors can embed the widget on a page view and quickly resize the playing grid directly from the authoring UI.
4. **Interval Management:** React intervals can often trap stale state closures. To parsimoniously loop without causing memory leaks, a combination of `useCallback` and `useRef` allows the engine to accurately access the current iteration cycle.

## Implementing the plan

As stated previously, Gemini's plan was pretty sound overall. Here's where I had to step in.

1. I had to run `npm run createLib` before `npm run create`.
2. It was wrong about the valid subtype options during widget creation (I chose `PAGE & CASE`).
3. It's `config.json` recommendation was incomplete, I had to graft in its suggestions with a bit of care.
4. It didn't come up with anything for Storybook, and what had been autogenerated by the component builder was of course not initially totally compatible with Gemini's output. It took one round of vibing with Gemini plus some hand polish to get that in order.
5. The code didn't pass linting on publication, but it was just few minor violations. I just switched them off in [eslint.config.mjs](eslint.config.mjs) since this is only a lightweight experiment anyway. The rules were:
   - `@typescript-eslint/no-unused-vars`
   - `no-plusplus`
   - `react/no-array-index-key`

All told, I think I spent more time typing this up then coding — probably about 15 minutes of actual hands-on-keyboard dev work, and another 15 minutes "talking" to Gemini. Maybe another 5 minutes were spent on publishing the component to my personal Infinity environment and adding it to my sandbox app through the reuse library.

Note that I did this through Gemini's chat interface, not with VSCode and Copilot, or OpenCode, or Claude Code. That would add another level of capability and ergonomics. But I wanted to see how competent a model alone could be, and the answer for this experiment at least is: quite good!
