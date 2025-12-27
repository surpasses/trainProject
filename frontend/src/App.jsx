import { StoreProvider, useStore } from './components/store';
import NetworkMap from './components/NetworkMap';
import RoutePanel from './components/RoutePanel';
import './App.css';

function AppContent() {
  const { isInitialized, state } = useStore();

  if (!isInitialized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0e17]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-mono text-sm">Loading network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0a0e17]">
      {/* Full-screen map */}
      <NetworkMap />
      
      {/* Route Panel - Bottom Left (shows when route is calculated) */}
      {state.route && <RoutePanel />}
      
      {/* Error Toast */}
      {state.error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-red-900/90 border border-red-700 text-red-100 px-4 py-2 rounded-lg shadow-xl">
            {state.error}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
