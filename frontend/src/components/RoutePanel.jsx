import { useStore, lineColors } from './store';

// Highlighted route color - distinct magenta/pink
const ROUTE_COLOR = '#e879f9';

// Get the primary line color for a station
function getStationLineColor(lines) {
  if (!lines || lines.length === 0) return '#9ca3af';
  const primaryLine = lines[0];
  return lineColors[primaryLine] || '#9ca3af';
}

function RoutePanel() {
  const { state, actions } = useStore();
  const { route } = state;

  if (!route) return null;

  return (
    <div className="absolute top-4 left-4 z-20 w-72 animate-fade-in">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
        {/* Header with stats */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xl font-bold" style={{ color: ROUTE_COLOR }}>{route.distance}</span>
              <span className="text-xs text-gray-400 ml-1">km</span>
            </div>
            <div className="text-gray-600">•</div>
            <div>
              <span className="text-xl font-bold text-white">{route.stationCount}</span>
              <span className="text-xs text-gray-400 ml-1">stops</span>
            </div>
          </div>
          <button
            onClick={actions.clearRoute}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Clear route"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Station List */}
        <div className="max-h-64 overflow-y-auto">
          <div className="py-2">
            {route.pathWithCoords.map((station, index) => {
              const isFirst = index === 0;
              const isLast = index === route.pathWithCoords.length - 1;
              const stationColor = getStationLineColor(station.lines);

              return (
                <div key={`${station.name}-${index}`} className="flex items-stretch px-3">
                  {/* Timeline */}
                  <div className="w-6 flex flex-col items-center flex-shrink-0">
                    {!isFirst && <div className="w-0.5 h-1.5" style={{ backgroundColor: `${ROUTE_COLOR}80` }} />}
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: isFirst ? '#10b981' : isLast ? '#3b82f6' : stationColor,
                        boxShadow: (isFirst || isLast) ? `0 0 6px ${isFirst ? '#10b981' : '#3b82f6'}` : 'none'
                      }}
                    />
                    {!isLast && <div className="w-0.5 flex-1" style={{ backgroundColor: `${ROUTE_COLOR}80` }} />}
                  </div>

                  {/* Station Info */}
                  <div 
                    className="flex-1 py-1 min-h-[28px] flex items-center gap-2 cursor-pointer hover:bg-gray-800/50 rounded px-1 -mx-1 transition-colors"
                    onMouseEnter={() => actions.setHoveredStation(station.name)}
                    onMouseLeave={() => actions.setHoveredStation(null)}
                  >
                    <span 
                      className={`text-sm ${isFirst || isLast ? 'font-semibold' : 'font-medium'}`}
                      style={{ 
                        color: isFirst ? '#10b981' : isLast ? '#3b82f6' : stationColor 
                      }}
                    >
                      {station.name}
                    </span>
                    {/* Show line badge */}
                    {station.lines && station.lines.length > 0 && (
                      <span 
                        className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ 
                          backgroundColor: `${stationColor}25`,
                          color: stationColor
                        }}
                      >
                        {station.lines[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoutePanel;
