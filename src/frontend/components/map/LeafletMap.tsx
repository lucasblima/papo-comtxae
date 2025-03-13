import React, { useEffect, useRef, useState } from 'react';
// Remover importação direta do Leaflet
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
import { UserLocation, MapStyle } from '../../types/map';
import styles from './InteractiveMap.module.css';
import { LeafletMapProps } from './types';

/**
 * Componente que renderiza o mapa usando Leaflet
 * Este componente deve ser carregado dinamicamente com Next.js dynamic import
 * para evitar erros de SSR, já que o Leaflet depende da API do navegador
 */
const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom,
  userLocation,
  municipalityData,
  disablePulse = false,
  mapStyle = {
    primaryColor: '#4f46e5',
    secondaryColor: '#818cf8',
    accentColor: '#c7d2fe',
    radiusSize: 2000
  },
  onMapLoaded,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const municipalityLayerRef = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Inicializa o mapa com um atraso para garantir que o container esteja renderizado
  useEffect(() => {
    // Garantir que estamos no navegador antes de inicializar o Leaflet
    if (typeof window === 'undefined') return;
    
    // Importar Leaflet dinamicamente apenas no cliente
    import('leaflet').then((L) => {
      // Importar o CSS do Leaflet como side effect
      // Note: CSS importado globalmente em globals.css
      // require('leaflet/dist/leaflet.css');
      
      if (!mapContainerRef.current) return;

      // Garantir que o container tenha dimensões antes de inicializar o mapa
      const containerEl = mapContainerRef.current;
      if (containerEl.clientHeight === 0 || containerEl.clientWidth === 0) {
        console.warn('Container do mapa não tem dimensões definidas, adiando inicialização');
        
        // Tenta novamente após um breve atraso para dar tempo do container ser renderizado
        const timer = setTimeout(() => {
          if (containerEl.clientHeight > 0 && containerEl.clientWidth > 0) {
            initializeMap(L.default);
          } else {
            console.error('Container do mapa continua sem dimensões após atraso');
          }
        }, 200);
        
        return () => clearTimeout(timer);
      }
      
      initializeMap(L.default);
      
      // Retorna uma função para limpar o timeout
      return undefined;
    }).catch(err => {
      console.error('Erro ao carregar o Leaflet:', err);
      return undefined;
    });
    
    function initializeMap(L: any) {
      if (mapInstanceRef.current) return; // Evita inicialização dupla
      
      try {
        // Criar a instância do mapa
        const map = L.map(mapContainerRef.current, {
          // Opções para evitar erros de zoom
          zoomSnap: 0.5,
          zoomDelta: 0.5,
          wheelPxPerZoomLevel: 120,
          fadeAnimation: true,
          zoomAnimation: true
        }).setView(center, zoom);
        
        // Adicionar camada de tile (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Adicionar um handler para detectar quando o mapa terminar de carregar
        map.once('load', () => {
          setMapInitialized(true);
          console.log('Mapa inicializado com sucesso');
        });
        
        // Trigger manual de invalidateSize para garantir que o mapa se ajuste corretamente
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
        // Salvar a referência do mapa
        mapInstanceRef.current = map;
        
        // Notificar que o mapa foi carregado
        if (onMapLoaded) {
          onMapLoaded(map);
        }
      } catch (error) {
        console.error('Erro ao inicializar mapa Leaflet:', error);
      }
      
      // Função não retorna valor, apenas executa ações
      return undefined;
    }
    
    return () => {
      // Limpa o mapa quando o componente for desmontado
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, onMapLoaded]);

  // Adiciona o marcador da localização do usuário
  useEffect(() => {
    // Garantir que estamos no navegador
    if (typeof window === 'undefined') return;
    
    const map = mapInstanceRef.current;
    if (!map || !userLocation || !mapInitialized) return;

    // Carregar o Leaflet apenas no cliente
    import('leaflet').then((L) => {
      // Cria um ícone pulsante para o marcador se não estiver desabilitado
      let userMarker: any;
      
      try {
        if (!disablePulse) {
          // Ícone pulsante personalizado do Papo Social
          const customPulseIcon = L.default.divIcon({
            className: styles.pulseIcon,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: `
              <div class="${styles.papoSocialMarker}" style="background-color: ${mapStyle.primaryColor}">
                <div class="${styles.pulse}" style="background-color: ${mapStyle.primaryColor}"></div>
                <div class="${styles.markerLogo}">PS</div>
              </div>
            `
          });
          
          userMarker = L.default.marker([userLocation.lat, userLocation.lng], { icon: customPulseIcon }).addTo(map);
        } else {
          // Ícone estático personalizado do Papo Social
          const customIcon = L.default.divIcon({
            className: styles.customIcon,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            html: `
              <div class="${styles.papoSocialMarker}" style="background-color: ${mapStyle.primaryColor}">
                <div class="${styles.markerLogo}">PS</div>
              </div>
            `
          });
          
          userMarker = L.default.marker([userLocation.lat, userLocation.lng], { icon: customIcon }).addTo(map);
        }

        // Adiciona tooltip ao marcador
        userMarker.bindTooltip(`
          <div class="text-center p-2">
            <strong>${userLocation.city || 'Sua localização'}</strong>
            <p>Papo Social está conectando pessoas próximas a você!</p>
          </div>
        `);

        // Adiciona círculo ao redor da localização do usuário
        L.default.circle([userLocation.lat, userLocation.lng], {
          color: mapStyle.primaryColor,
          fillColor: mapStyle.secondaryColor,
          fillOpacity: 0.2,
          radius: mapStyle.radiusSize || 2000
        }).addTo(map);

        const userMarkerRef = userMarker;
        return () => {
          // Remove o marcador quando o componente for atualizado
          if (map && userMarkerRef) {
            try {
              map.removeLayer(userMarkerRef);
            } catch (e) {
              console.error('Erro ao remover marcador:', e);
            }
          }
        };
      } catch (error) {
        console.error('Erro ao adicionar marcador:', error);
        return undefined;
      }
      
      return undefined;
    }).catch(err => {
      console.error('Erro ao carregar o Leaflet para o marcador:', err);
      return undefined;
    });
    
    return undefined;
  }, [userLocation, disablePulse, mapStyle, mapInitialized]);

  // Adiciona a camada do município quando os dados estiverem disponíveis
  useEffect(() => {
    // Garantir que estamos no navegador
    if (typeof window === 'undefined') return;
    
    const map = mapInstanceRef.current;
    if (!map || !mapInitialized) return;

    // Carregando Leaflet apenas no cliente
    import('leaflet').then((L) => {
      try {
        // Remove a camada anterior se existir
        if (municipalityLayerRef.current) {
          map.removeLayer(municipalityLayerRef.current);
        }

        // Se não tiver dados do município, apenas centraliza no usuário
        if (!municipalityData) {
          if (userLocation) {
            map.setView([userLocation.lat, userLocation.lng], zoom);
          }
          return undefined;
        }

        // Cria a camada do município com os dados GeoJSON
        const municipalityLayer = L.default.geoJSON(municipalityData, {
          style: {
            color: mapStyle.primaryColor,
            weight: 2,
            opacity: 0.8,
            fillColor: mapStyle.accentColor,
            fillOpacity: 0.3
          }
        }).addTo(map);

        // Adiciona um popup com o nome do município
        municipalityLayer.bindPopup(`
          <div class="text-center p-2">
            <strong>${userLocation?.city || 'Seu município'}</strong>
            <p>Descubra o que está acontecendo em sua comunidade!</p>
          </div>
        `);

        // Ajusta o zoom para mostrar todo o município com um timeout para garantir que o mapa está pronto
        setTimeout(() => {
          try {
            // Verifica se o município tem bounds válidos antes de ajustar o zoom
            const bounds = municipalityLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13,
                animate: true
              });
            } else {
              console.warn('Bounds do município inválidos, mantendo zoom original');
              if (userLocation) {
                map.setView([userLocation.lat, userLocation.lng], zoom);
              }
            }
          } catch (e) {
            console.error('Erro ao ajustar zoom para o município:', e);
            if (userLocation) {
              map.setView([userLocation.lat, userLocation.lng], zoom);
            }
          }
        }, 300);

        // Salva a referência para limpar depois
        municipalityLayerRef.current = municipalityLayer;
      } catch (error) {
        console.error('Erro ao adicionar camada do município:', error);
      }
      
      return undefined;
    }).catch(err => {
      console.error('Erro ao carregar o Leaflet para o município:', err);
      return undefined;
    });

    return () => {
      // Remove a camada quando o componente for atualizado
      if (map && municipalityLayerRef.current) {
        try {
          map.removeLayer(municipalityLayerRef.current);
          municipalityLayerRef.current = null;
        } catch (e) {
          console.error('Erro ao remover camada do município:', e);
        }
      }
    };
  }, [municipalityData, userLocation, zoom, mapStyle, mapInitialized]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%' }}
      className={styles.mapContainer}
      data-testid="leaflet-map"
    />
  );
};

export default LeafletMap; 