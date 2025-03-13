import { UserLocation, MapStyle } from '../../types/map';

/**
 * Props para o componente LeafletMap
 */
export interface LeafletMapProps {
  /** Centro do mapa em coordenadas [lat, lng] */
  center: [number, number];
  /** Nível de zoom inicial */
  zoom: number;
  /** Localização do usuário */
  userLocation: UserLocation;
  /** Dados do município (GeoJSON) */
  municipalityData: any;
  /** Desabilita a animação de pulso */
  disablePulse?: boolean;
  /** Personalização de estilo do mapa */
  mapStyle?: MapStyle;
  /** Callback para quando o mapa é carregado */
  onMapLoaded?: (mapInstance: any) => void;
} 