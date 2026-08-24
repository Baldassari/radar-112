import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/layout/NavBar';
import { useIsMobileViewport } from './hooks/useMediaQuery';
import { StreamProvider } from './hooks/useOcorrenciaStream';
import { DetalhePage } from './routes/DetalhePage';
import { DistritosPage } from './routes/DistritosPage';
import { HistoricoPage } from './routes/HistoricoPage';
import { MapaPage } from './routes/MapaPage';
import { OcorrenciasPage } from './routes/OcorrenciasPage';

function Shell() {
  const isMobile = useIsMobileViewport();
  return (
    <div className="app-shell">
      {!isMobile && <NavBar />}
      <div className="app-main">
        <Routes>
          <Route path="/" element={<MapaPage />} />
          <Route path="/ocorrencias" element={<OcorrenciasPage />} />
          <Route path="/ocorrencias/:id" element={<DetalhePage />} />
          <Route path="/historico" element={<HistoricoPage />} />
          <Route path="/distritos" element={<DistritosPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 10_000, retry: 1 } } }));

  return (
    <QueryClientProvider client={queryClient}>
      <StreamProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </StreamProvider>
    </QueryClientProvider>
  );
}
