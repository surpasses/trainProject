// frontend/src/components/store.jsx
import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5100/api';

// Line colors matching NSW Transport branding
export const lineColors = {
  T1: '#f99d1c',  // North Shore & Western Line - Yellow/Orange
  T2: '#0098cd',  // Inner West & Leppington - Blue
  T3: '#f37021',  // Bankstown Line - Orange
  T4: '#005aa3',  // Eastern Suburbs & Illawarra - Dark Blue
  T5: '#c4258f',  // Cumberland Line - Purple/Pink
  T7: '#6f818e',  // Olympic Park - Grey
  T8: '#00954c',  // Airport & South Line - Green
  T9: '#d11f2f',  // Northern Line - Red
  M: '#009b77',   // Metro - Teal
};

// Draw configuration for the canvas
export const drawConfig = {
  nodeRadius: (active, highlighted, hovered) => {
    if (hovered) return 8;
    if (highlighted) return 6;
    if (active) return 7;
    return 5;
  },
};

// Initial state
export const initialState = {
  nodedata: {},
  graphdata: {},
  bounds: null,
  stationList: [],
  fromStation: null,
  toStation: null,
  algorithm: 'dijkstra',
  route: null,
  isLoading: false,
  error: null,
  hoveredStation: null,
};

// Action types
const ACTIONS = {
  SET_GRAPH_DATA: 'SET_GRAPH_DATA',
  SET_STATION_LIST: 'SET_STATION_LIST',
  SET_FROM_STATION: 'SET_FROM_STATION',
  SET_TO_STATION: 'SET_TO_STATION',
  SET_ALGORITHM: 'SET_ALGORITHM',
  SET_ROUTE: 'SET_ROUTE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_HOVERED_STATION: 'SET_HOVERED_STATION',
  CLEAR_ROUTE: 'CLEAR_ROUTE',
};

// Reducer
export const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_GRAPH_DATA:
      return {
        ...state,
        nodedata: action.payload.nodedata,
        graphdata: action.payload.graphdata,
        bounds: action.payload.bounds,
      };
    case ACTIONS.SET_STATION_LIST:
      return { ...state, stationList: action.payload };
    case ACTIONS.SET_FROM_STATION:
      return { ...state, fromStation: action.payload, route: null };
    case ACTIONS.SET_TO_STATION:
      return { ...state, toStation: action.payload };
    case ACTIONS.SET_ALGORITHM:
      return { ...state, algorithm: action.payload };
    case ACTIONS.SET_ROUTE:
      return { ...state, route: action.payload, isLoading: false, error: null };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case ACTIONS.SET_HOVERED_STATION:
      return { ...state, hoveredStation: action.payload };
    case ACTIONS.CLEAR_ROUTE:
      return { ...state, route: null, fromStation: null, toStation: null, error: null };
    default:
      return state;
  }
};

// Context
const StoreContext = createContext(null);

// Helper to find route
async function fetchRoute(from, to, algorithm) {
  const res = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, algorithm })
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to find route');
  }
  
  return res.json();
}

// Provider component
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const pendingRouteRef = useRef(null);

  // Fetch graph data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [graphRes, stationsRes] = await Promise.all([
          fetch(`${API_BASE}/graph-data`),
          fetch(`${API_BASE}/station-list`)
        ]);
        
        const graphData = await graphRes.json();
        const stationList = await stationsRes.json();
        
        dispatch({ type: ACTIONS.SET_GRAPH_DATA, payload: graphData });
        dispatch({ type: ACTIONS.SET_STATION_LIST, payload: stationList });
        setIsInitialized(true);
      } catch (err) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load station data' });
        console.error('Failed to fetch data:', err);
      }
    }
    fetchData();
  }, []);

  // Auto-find route when both stations are selected
  useEffect(() => {
    if (state.fromStation && state.toStation && !state.route) {
      const key = `${state.fromStation}-${state.toStation}-${state.algorithm}`;
      pendingRouteRef.current = key;
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      fetchRoute(state.fromStation, state.toStation, state.algorithm)
        .then(route => {
          if (pendingRouteRef.current === key) {
            dispatch({ type: ACTIONS.SET_ROUTE, payload: route });
          }
        })
        .catch(err => {
          if (pendingRouteRef.current === key) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
          }
        });
    }
  }, [state.fromStation, state.toStation, state.algorithm, state.route]);

  // Actions
  const actions = {
    setHoveredStation: (station) => {
      dispatch({ type: ACTIONS.SET_HOVERED_STATION, payload: station });
    },
    clearRoute: () => {
      pendingRouteRef.current = null;
      dispatch({ type: ACTIONS.CLEAR_ROUTE });
    },
    selectStationOnMap: (station) => {
      // If clicking on an already selected station, deselect it
      if (station === state.fromStation) {
        pendingRouteRef.current = null;
        dispatch({ type: ACTIONS.CLEAR_ROUTE });
        return;
      }
      if (station === state.toStation) {
        dispatch({ type: ACTIONS.SET_TO_STATION, payload: null });
        dispatch({ type: ACTIONS.SET_ROUTE, payload: null });
        return;
      }
      
      // Select station
      if (!state.fromStation) {
        dispatch({ type: ACTIONS.SET_FROM_STATION, payload: station });
      } else if (!state.toStation) {
        dispatch({ type: ACTIONS.SET_TO_STATION, payload: station });
      } else {
        // Both selected - start fresh with new selection
        pendingRouteRef.current = null;
        dispatch({ type: ACTIONS.CLEAR_ROUTE });
        dispatch({ type: ACTIONS.SET_FROM_STATION, payload: station });
      }
    }
  };

  return (
    <StoreContext.Provider value={{ state, actions, isInitialized }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use store
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
