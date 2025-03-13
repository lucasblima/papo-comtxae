import { UserLocation } from '../types/map';

/**
 * Verifica se o código está sendo executado no navegador
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Fetches the user's location based on their IP address
 * 
 * @returns Promise with user location data
 */
export async function fetchUserLocation(): Promise<UserLocation | null> {
  try {
    // Verifica se estamos no navegador
    if (!isBrowser) {
      console.log('fetchUserLocation: executando no servidor, retornando localização padrão');
      return {
        lat: -23.5489, // São Paulo como fallback
        lng: -46.6388,
        city: 'São Paulo',
        country: 'BR',
        region: 'São Paulo',
        postal: '01000-000'
      };
    }
    
    // Use ipinfo.io to get location by IP
    const response = await fetch('https://ipinfo.io/json?token=1a11bd55cc8f9c');
    const data = await response.json();
    
    if (!data.loc) {
      console.error('Localização não encontrada nos dados retornados');
      return null;
    }
    
    // Parse location from "lat,lng" string
    const [lat, lng] = data.loc.split(',').map(Number);
    
    return {
      lat,
      lng,
      city: data.city,
      country: data.country,
      region: data.region,
      postal: data.postal
    };
  } catch (error) {
    console.error('Erro ao obter localização do usuário:', error);
    return null;
  }
}

/**
 * Gets the user's location using the browser's geolocation API
 * 
 * @returns Promise with user location data
 */
export function getUserBrowserLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    // Verifica se estamos no navegador
    if (!isBrowser) {
      console.log('getUserBrowserLocation: executando no servidor, retornando nulo');
      resolve(null);
      return;
    }
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocalização não é suportada neste navegador');
      resolve(null);
      return;
    }
    
    // Request the user's position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Erro na geolocalização do navegador:', error);
        resolve(null);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Formats coordinates to a human-readable string
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted coordinates string
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  const latAbs = Math.abs(lat).toFixed(4);
  const lngAbs = Math.abs(lng).toFixed(4);
  
  return `${latAbs}° ${latDir}, ${lngAbs}° ${lngDir}`;
} 