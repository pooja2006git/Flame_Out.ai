import React, { useState, useEffect, useCallback } from 'react';
import { Mountain, Droplets, X, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

// Graph node interface
interface GraphNode {
  id: number;
  x: number;
  y: number;
  hasTower: boolean;
}

// Edge interface
interface Edge {
  from: number;
  to: number;
}

// Popup interface
interface Popup {
  id: string;
  message: string;
  icon: React.ReactNode;
  type: 'info' | 'warning' | 'success' | 'error';
}

const ForestFireGame: React.FC = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showStartMessage, setShowStartMessage] = useState(true);
  const [gameResult, setGameResult] = useState<'none' | 'success' | 'failure'>('none');
  const [animatingResult, setAnimatingResult] = useState(false);
  const [firstTowerPlaced, setFirstTowerPlaced] = useState(false);
  const [hasShownFirstTowerTip, setHasShownFirstTowerTip] = useState(false);

  // Create static graph with exact coordinates
  const createStaticGraph = useCallback(() => {
    // Nodes with exact coordinates (shifted by 50px to ensure visibility)
    const graphNodes: GraphNode[] = [
      { id: 0, x: 150, y: 270, hasTower: false },
      { id: 1, x: 290, y: 150, hasTower: false }, // (240,100) + 50 offset
      { id: 2, x: 450, y: 130, hasTower: false }, // (400,80) + 50 offset
      { id: 3, x: 610, y: 150, hasTower: false }, // (560,100) + 50 offset
      { id: 4, x: 750, y: 270, hasTower: false },
      { id: 5, x: 610, y: 390, hasTower: false }, // (560,340) + 50 offset
      { id: 6, x: 450, y: 410, hasTower: false }, // (400,360) + 50 offset
      { id: 7, x: 290, y: 390, hasTower: false }, // (240,340) + 50 offset
      { id: 8, x: 450, y: 250, hasTower: false }  // (400,200) + 50 offset
    ];

    // Edges as specified
    const graphEdges: Edge[] = [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5 }, { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 0 },
      { from: 1, to: 8 }, { from: 2, to: 8 }, { from: 3, to: 8 }, { from: 7, to: 8 },
      { from: 6, to: 8 }, { from: 5, to: 8 }, { from: 7, to: 6 }, { from: 6, to: 5 }
    ];

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, []);

  // Check if an edge is covered by towers
  const isEdgeCovered = useCallback((edge: Edge): boolean => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    return (fromNode?.hasTower || toNode?.hasTower) || false;
  }, [nodes]);

  // Get adjacent edges for a node
  const getAdjacentEdges = useCallback((nodeId: number): Edge[] => {
    return edges.filter(edge => edge.from === nodeId || edge.to === nodeId);
  }, [edges]);

  // Toggle tower on node
  const toggleTower = useCallback((nodeId: number) => {
    if (animatingResult) return;

    setNodes(prevNodes => {
      const newNodes = prevNodes.map(node => {
        if (node.id === nodeId) {
          const wasEmpty = !node.hasTower;
          
          // Check if this is the first tower placed
          if (wasEmpty && !firstTowerPlaced) {
            setFirstTowerPlaced(true);
          }
          
          return { ...node, hasTower: !node.hasTower };
        }
        return node;
      });
      
      return newNodes;
    });
  }, [animatingResult, firstTowerPlaced]);

  // Show first tower tip
  useEffect(() => {
    if (firstTowerPlaced && !hasShownFirstTowerTip && gameStarted) {
      setTimeout(() => {
        addPopup({
          id: 'first-tower-tip',
          message: '✅ Water tanks protect all connected roads. Try to cover all roads with as few water tanks as possible!',
          icon: <CheckCircle className="w-6 h-6" />,
          type: 'info'
        });
        setHasShownFirstTowerTip(true);
      }, 500);
    }
  }, [firstTowerPlaced, hasShownFirstTowerTip, gameStarted]);

  // Add popup
  const addPopup = useCallback((popup: Popup) => {
    setPopups(prev => [...prev, popup]);
  }, []);

  // Remove popup
  const removePopup = useCallback((id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
  }, []);

  // Check if solution is minimal vertex cover
  const isMinimalVertexCover = useCallback((): boolean => {
    const toweredNodes = nodes.filter(n => n.hasTower);
    
    // Check if all edges are covered
    const allCovered = edges.every(edge => isEdgeCovered(edge));
    if (!allCovered) return false;

    // Check if removing any tower would leave some edge uncovered (minimality)
    for (const toweredNode of toweredNodes) {
      // Temporarily remove tower
      const originalState = toweredNode.hasTower;
      toweredNode.hasTower = false;
      
      const stillAllCovered = edges.every(edge => isEdgeCovered(edge));
      
      // Restore tower
      toweredNode.hasTower = originalState;
      
      if (stillAllCovered) {
        return false; // Not minimal - this tower is redundant
      }
    }
    
    return true;
  }, [nodes, edges, isEdgeCovered]);

  // Check game completion with animations
  const checkGameCompletion = useCallback(() => {
    if (animatingResult) return;

    const allCovered = edges.every(edge => isEdgeCovered(edge));

    setAnimatingResult(true);

    if (allCovered && isMinimalVertexCover()) {
      setGameResult('success');
      setTimeout(() => {
        addPopup({
          id: 'victory',
          message: '🎉 Congratulations! You placed the minimum towers and stopped the fire.',
          icon: <CheckCircle className="w-6 h-6" />,
          type: 'success'
        });
        setAnimatingResult(false);
      }, 3000);
    } else if (allCovered) {
      setGameResult('failure');
      setTimeout(() => {
        addPopup({
          id: 'suboptimal',
          message: '⚠️ You used more towers than needed. Try again with fewer.',
          icon: <AlertTriangle className="w-6 h-6" />,
          type: 'warning'
        });
        setAnimatingResult(false);
        setGameResult('none');
      }, 2000);
    } else {
      setGameResult('failure');
      setTimeout(() => {
        addPopup({
          id: 'failure',
          message: '⚠️ Some roads are still burning! Place more water tanks or choose better mountains.',
          icon: <Flame className="w-6 h-6" />,
          type: 'error'
        });
        setAnimatingResult(false);
        setGameResult('none');
      }, 2000);
    }
  }, [edges, isEdgeCovered, isMinimalVertexCover, addPopup, animatingResult]);

  // Reset game
  const resetGame = useCallback(() => {
    if (animatingResult) return;
    
    createStaticGraph();
    setGameResult('none');
    setPopups([]);
    setFirstTowerPlaced(false);
    setHasShownFirstTowerTip(false);
  }, [createStaticGraph, animatingResult]);

  // Initialize graph and show start message
  useEffect(() => {
    createStaticGraph();
  }, [createStaticGraph, addPopup]);

  // Handle start message dismiss
  const dismissStartMessage = () => {
    setShowStartMessage(false);
    setGameStarted(true);
  };

  if (nodes.length === 0) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-900 to-red-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading Forest...</div>
    </div>;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-yellow-900 overflow-hidden">
      {/* Animated fire background */}
      <div className="absolute inset-0">
        {/* Smoke effect */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gray-600 rounded-full blur-xl animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${50 + Math.random() * 100}px`,
                height: `${50 + Math.random() * 100}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Fire particles */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-t from-red-500 to-orange-400 rounded-full blur-sm animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${10 + Math.random() * 20}px`,
                height: `${10 + Math.random() * 20}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>

        {/* Glowing fire effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-red-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-56 h-56 bg-yellow-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Start message overlay */}
      {showStartMessage && (
        <div className="absolute top-0 left-0 right-0 bg-black/40 flex items-start justify-center pt-8 z-50">
          <div className="text-center max-w-2xl relative">
            {/* X button */}
            <button
              onClick={dismissStartMessage}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors duration-200 z-10"
            >
              <X size={20} />
            </button>
            
            <div className="text-4xl font-bold text-white mb-3 animate-pulse">
              🔥 The forest is on fire!
            </div>
            <div className="text-lg text-orange-200 leading-relaxed">
              Place water tanks on mountains to put out the fire on connected roads.<br/>
              Each water tank protects all roads linked to its mountain.<br/><br/>
              💡 Your goal: Find the minimum number of mountains where you can place water tanks so that all roads are safe and you can escape the forest!
            </div>
            {/* Fire animation around text */}
            <div className="absolute -inset-4 opacity-40">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-gradient-to-t from-red-500 to-orange-400 rounded-full blur-lg animate-ping"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '12px',
                    height: '12px',
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Graph visualization - centered and properly sized */}
      <div className="relative w-full h-screen flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 900 500" style={{ zIndex: 1 }}>
          {/* Success water animation */}
          {gameResult === 'success' && (
            <defs>
              <radialGradient id="waterGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8">
                  <animate attributeName="stop-opacity" values="0;0.8;0" dur="3s" />
                </stop>
                <stop offset="100%" stopColor="#1e40af" stopOpacity="0.4">
                  <animate attributeName="stop-opacity" values="0;0.4;0" dur="3s" />
                </stop>
              </radialGradient>
            </defs>
          )}

          {/* Edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from)!;
            const toNode = nodes.find(n => n.id === edge.to)!;
            const isCovered = isEdgeCovered(edge);
            
            return (
              <g key={`edge-${index}`}>
                {/* Base edge */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={gameResult === 'success' ? '#3b82f6' : (isCovered ? '#10b981' : '#ef4444')}
                  strokeWidth="2"
                  className="transition-all duration-500"
                  style={{
                    filter: gameResult === 'success' 
                      ? 'drop-shadow(0 0 12px #3b82f6)' 
                      : isCovered 
                        ? 'drop-shadow(0 0 8px #10b981)' 
                        : 'drop-shadow(0 0 8px #ef4444)',
                  }}
                />
                
                {/* Water animation for success */}
                {gameResult === 'success' && (
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="url(#waterGradient)"
                    strokeWidth="6"
                    className="animate-pulse"
                  />
                )}

                {/* Fire animation on uncovered edges during failure */}
                {gameResult === 'failure' && !isCovered && (
                  <>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#ff4500"
                      strokeWidth="4"
                      className="animate-pulse"
                      style={{ filter: 'drop-shadow(0 0 15px #ff4500)' }}
                    />
                    {/* Fire particles along the edge */}
                    {[...Array(3)].map((_, i) => {
                      const t = (i + 1) / 4;
                      const x = fromNode.x + (toNode.x - fromNode.x) * t;
                      const y = fromNode.y + (toNode.y - fromNode.y) * t;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#ff6b35"
                          className="animate-ping"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                      );
                    })}
                  </>
                )}

                {/* Regular fire animation on uncovered edges */}
                {gameResult === 'none' && !isCovered && (
                  <circle
                    cx={(fromNode.x + toNode.x) / 2}
                    cy={(fromNode.y + toNode.y) / 2}
                    r="4"
                    fill="#ff6b35"
                    className="animate-ping"
                  >
                    <animate
                      attributeName="r"
                      values="2;6;2"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes (mountains and towers) */}
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ 
              left: `${(node.x / 900) * 100}%`, 
              top: `${(node.y / 500) * 100}%`, 
              zIndex: 2 
            }}
            onClick={() => toggleTower(node.id)}
          >
            {/* Mountain base */}
            <div className="relative">
              <Mountain 
                size={40} 
                className={`transition-all duration-200 drop-shadow-lg group-hover:scale-110 transform ${
                  gameResult === 'success' ? 'text-blue-600' : 'text-green-700 hover:text-green-600'
                }`}
              />
              
              {/* Tower overlay */}
              {node.hasTower && (
                <div className="absolute -top-1 -right-1">
                  <Droplets 
                    size={20} 
                    className={`drop-shadow-lg animate-pulse ${
                      gameResult === 'success' ? 'text-blue-400' : 'text-yellow-400'
                    }`}
                    style={{ 
                      filter: gameResult === 'success' 
                        ? 'drop-shadow(0 0 6px #60a5fa)' 
                        : 'drop-shadow(0 0 6px #fbbf24)' 
                    }}
                  />
                </div>
              )}
              
              {/* Water splash effect for success */}
              {gameResult === 'success' && node.hasTower && (
                <div className="absolute -inset-4 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
              )}
              
              {/* Node ID label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold bg-black bg-opacity-50 rounded px-1 py-0.5">
                {node.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control panel */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-4">
        <button
          onClick={checkGameCompletion}
          disabled={animatingResult}
          className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 ${
            animatingResult 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
          }`}
        >
          {animatingResult ? 'Checking...' : 'Check Solution'}
        </button>
        
        <button
          onClick={resetGame}
          disabled={animatingResult}
          className={`font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 ${
            animatingResult 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
          }`}
        >
          Reset Game
        </button>
      </div>

      {/* Popup system */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {popups.map(popup => (
          <div
            key={popup.id}
            className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto animate-in slide-in-from-top duration-300"
          >
            <div className={`
              max-w-md p-4 rounded-lg shadow-xl backdrop-blur-sm border-2 flex items-center space-x-3
              ${popup.type === 'info' ? 'bg-blue-900/90 border-blue-400 text-blue-100' : ''}
              ${popup.type === 'warning' ? 'bg-orange-900/90 border-orange-400 text-orange-100' : ''}
              ${popup.type === 'success' ? 'bg-green-900/90 border-green-400 text-green-100' : ''}
              ${popup.type === 'error' ? 'bg-red-900/90 border-red-400 text-red-100' : ''}
            `}>
              {popup.icon}
              <p className="flex-1 font-medium">{popup.message}</p>
              <button
                onClick={() => removePopup(popup.id)}
                className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white z-10 max-w-xs">
        <h3 className="font-bold mb-2 text-sm">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <Mountain size={14} className="text-green-700" />
            <span>Mountain (click to place tower)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets size={14} className="text-yellow-400" />
            <span>Water Tank (covers connected roads)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-green-500"></div>
            <span>Protected road</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-red-500"></div>
            <span>Burning road</span>
          </div>
          <div className="mt-2 p-1.5 bg-yellow-900/50 rounded text-xs">
            <strong>Goal:</strong> Find the minimum number of water tanks needed to cover all roads!
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForestFireGame;