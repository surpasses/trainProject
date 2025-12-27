import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva';
import { useStore, drawConfig, lineColors } from './store';

// Route highlight color - distinct magenta/pink (different from all train lines)
const ROUTE_COLOR = '#e879f9';
const ROUTE_GLOW = '#d946ef';

function NetworkMap() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialTransform, setInitialTransform] = useState(null);
  const stageRef = useRef(null);

  const { state, actions } = useStore();
  const { nodedata, graphdata, bounds, fromStation, toStation, route, hoveredStation } = state;

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate initial transform to fit the network
  useEffect(() => {
    if (!bounds || dimensions.width === 0) return;

    const padding = 60;
    const availableWidth = dimensions.width - padding * 2;
    const availableHeight = dimensions.height - padding * 2;

    const dataWidth = bounds.maxX - bounds.minX;
    const dataHeight = bounds.maxY - bounds.minY;

    const scaleX = availableWidth / dataWidth;
    const scaleY = availableHeight / dataHeight;
    const fitScale = Math.min(scaleX, scaleY);

    // Calculate offset to center
    const offsetX = padding + (availableWidth - dataWidth * fitScale) / 2;
    const offsetY = padding + (availableHeight - dataHeight * fitScale) / 2;

    const transform = {
      scale: fitScale,
      minX: bounds.minX,
      maxY: bounds.maxY,
      offsetX,
      offsetY
    };

    setInitialTransform(transform);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [bounds, dimensions]);

  // Convert geo coordinates to screen coordinates
  const toScreen = useCallback((lon, lat) => {
    if (!initialTransform) return { x: 0, y: 0 };
    const { scale: fitScale, minX, maxY, offsetX, offsetY } = initialTransform;
    return {
      x: (lon - minX) * fitScale + offsetX,
      y: (maxY - lat) * fitScale + offsetY
    };
  }, [initialTransform]);

  // Set of stations in the current route path
  const pathSet = useMemo(() => {
    if (!route?.path) return new Set();
    return new Set(route.path);
  }, [route]);

  // Set of edges in the current route path
  const pathEdges = useMemo(() => {
    if (!route?.path || route.path.length < 2) return new Set();
    const edges = new Set();
    for (let i = 0; i < route.path.length - 1; i++) {
      const a = route.path[i];
      const b = route.path[i + 1];
      edges.add(`${a}-${b}`);
      edges.add(`${b}-${a}`);
    }
    return edges;
  }, [route]);

  // Generate edges from graphdata
  const edges = useMemo(() => {
    if (!initialTransform) return [];
    const edgeList = [];
    const processed = new Set();

    Object.entries(graphdata).forEach(([from, neighbors]) => {
      Object.keys(neighbors).forEach(to => {
        const key = [from, to].sort().join('-');
        if (!processed.has(key) && nodedata[from] && nodedata[to]) {
          processed.add(key);
          const fromPos = toScreen(nodedata[from].x, nodedata[from].y);
          const toPos = toScreen(nodedata[to].x, nodedata[to].y);
          const isActive = pathEdges.has(`${from}-${to}`);
          edgeList.push({
            key,
            from,
            to,
            points: [fromPos.x, fromPos.y, toPos.x, toPos.y],
            isActive
          });
        }
      });
    });

    return edgeList;
  }, [graphdata, nodedata, toScreen, pathEdges, initialTransform]);

  // Generate nodes
  const nodes = useMemo(() => {
    if (!initialTransform) return [];
    return Object.entries(nodedata).map(([name, data]) => {
      const pos = toScreen(data.x, data.y);
      const isFrom = name === fromStation;
      const isTo = name === toStation;
      const isInPath = pathSet.has(name);
      const isHovered = name === hoveredStation;

      return {
        name,
        x: pos.x,
        y: pos.y,
        isFrom,
        isTo,
        isActive: isFrom || isTo,
        isHighlighted: isInPath,
        isHovered,
        lines: data.lines || []
      };
    });
  }, [nodedata, toScreen, fromStation, toStation, pathSet, hoveredStation, initialTransform]);

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.15;
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.3, Math.min(8, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    });
  };

  // Handle drag
  const handleDragEnd = (e) => {
    setPosition({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // Get primary line color for a station
  const getStationColor = (lines) => {
    if (!lines || lines.length === 0) return '#9ca3af';
    const primaryLine = lines[0];
    return lineColors[primaryLine] || '#9ca3af';
  };

  // Calculate node size based on zoom
  const getNodeRadius = (isActive, isHighlighted, isHovered) => {
    const baseRadius = drawConfig.nodeRadius(isActive, isHighlighted, isHovered);
    return baseRadius / Math.sqrt(scale);
  };

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        x={position.x}
        y={position.y}
        scaleX={scale}
        scaleY={scale}
      >
        {/* Background edges layer */}
        <Layer>
          {edges.filter(e => !e.isActive).map(edge => (
            <Line
              key={edge.key}
              points={edge.points}
              stroke={route ? 'rgba(75, 85, 99, 0.25)' : 'rgba(156, 163, 175, 0.5)'}
              strokeWidth={2 / scale}
              lineCap="round"
            />
          ))}
        </Layer>

        {/* Active route edges layer (on top) */}
        <Layer>
          {edges.filter(e => e.isActive).map(edge => (
            <Line
              key={`active-${edge.key}`}
              points={edge.points}
              stroke={ROUTE_COLOR}
              strokeWidth={4 / scale}
              lineCap="round"
              shadowColor={ROUTE_GLOW}
              shadowBlur={12 / scale}
              shadowOpacity={0.9}
            />
          ))}
        </Layer>

        {/* Nodes layer */}
        <Layer>
          {nodes.map(node => (
            <Group
              key={node.name}
              x={node.x}
              y={node.y}
              onClick={() => actions.selectStationOnMap(node.name)}
              onTap={() => actions.selectStationOnMap(node.name)}
              onMouseEnter={() => actions.setHoveredStation(node.name)}
              onMouseLeave={() => actions.setHoveredStation(null)}
            >
              {/* Outer glow for selected/path stations */}
              {(node.isActive || node.isHighlighted) && (
                <Circle
                  radius={(getNodeRadius(node.isActive, node.isHighlighted, node.isHovered) + 4) / scale}
                  fill="transparent"
                  stroke={node.isFrom ? '#10b981' : node.isTo ? '#3b82f6' : ROUTE_COLOR}
                  strokeWidth={2 / scale}
                  opacity={0.7}
                />
              )}
              
              {/* Main node circle */}
              <Circle
                radius={getNodeRadius(node.isActive, node.isHighlighted, node.isHovered)}
                fill={
                  node.isFrom ? '#10b981' :
                  node.isTo ? '#3b82f6' :
                  node.isHighlighted ? ROUTE_COLOR :
                  node.isHovered ? '#ffffff' :
                  getStationColor(node.lines)
                }
                stroke={node.isHovered || node.isActive ? '#ffffff' : 'rgba(0,0,0,0.3)'}
                strokeWidth={1 / scale}
              />
              
              {/* Label for hovered or active nodes */}
              {(node.isHovered || node.isActive) && (
                <Text
                  text={node.name}
                  fontSize={13 / scale}
                  fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  fontStyle="600"
                  fill="#ffffff"
                  x={12 / scale}
                  y={-7 / scale}
                  shadowColor="#000000"
                  shadowBlur={6 / scale}
                  shadowOpacity={1}
                />
              )}
            </Group>
          ))}
        </Layer>
      </Stage>

      {/* Legend - Always visible */}
      <Legend />

      {/* Minimal zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
        <button
          onClick={() => setScale(s => Math.min(8, s * 1.4))}
          className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded text-white text-lg font-bold transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.3, s / 1.4))}
          className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded text-white text-lg font-bold transition-colors"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="w-8 h-8 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs font-medium transition-colors"
          title="Reset view"
        >
          ⟲
        </button>
      </div>

      {/* Instructions overlay */}
      {!fromStation && !toStation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-300">Click a station to select start point</p>
          </div>
        </div>
      )}
      {fromStation && !toStation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-300">
              <span className="text-emerald-400">{fromStation}</span> → Click destination
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Legend component - Always visible
function Legend() {
  const trainLines = [
    { code: 'T1', name: 'North Shore & Western', color: lineColors.T1 },
    { code: 'T2', name: 'Inner West & Leppington', color: lineColors.T2 },
    { code: 'T3', name: 'Bankstown', color: lineColors.T3 },
    { code: 'T4', name: 'Eastern Suburbs', color: lineColors.T4 },
    { code: 'T5', name: 'Cumberland', color: lineColors.T5 },
    { code: 'T7', name: 'Olympic Park', color: lineColors.T7 },
    { code: 'T8', name: 'Airport & South', color: lineColors.T8 },
    { code: 'T9', name: 'Northern', color: lineColors.T9 },
    { code: 'M', name: 'Metro North West', color: lineColors.M },
  ];

  return (
    <div className="absolute bottom-16 right-4 z-10">
      <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-700">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Train Lines</span>
        </div>
        
        {/* Lines list */}
        <div className="p-2 space-y-0.5">
          {trainLines.map(line => (
            <div key={line.code} className="flex items-center gap-2 px-1 py-0.5">
              <div 
                className="w-5 h-3 rounded-sm flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: line.color }}
              >
                <span className="text-[8px] font-bold text-white">{line.code}</span>
              </div>
              <span className="text-[11px] text-gray-400">{line.name}</span>
            </div>
          ))}
          
          {/* Divider */}
          <div className="border-t border-gray-700 my-1.5" />
          
          {/* Route indicators */}
          <div className="flex items-center gap-2 px-1 py-0.5">
            <div 
              className="w-5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: ROUTE_COLOR, boxShadow: `0 0 8px ${ROUTE_GLOW}` }}
            />
            <span className="text-[11px] text-gray-400">Selected Route</span>
          </div>
          <div className="flex items-center gap-2 px-1 py-0.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0 bg-emerald-500 ml-1" />
            <span className="text-[11px] text-gray-400">Start</span>
          </div>
          <div className="flex items-center gap-2 px-1 py-0.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500 ml-1" />
            <span className="text-[11px] text-gray-400">End</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkMap;
