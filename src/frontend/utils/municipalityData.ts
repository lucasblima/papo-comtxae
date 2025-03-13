/**
 * Utilitário para obter dados geográficos de municípios brasileiros
 */

import axios from 'axios';
import { UserLocation } from '../types/map';

// Verifica se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined';

// URL base para obter os dados GeoJSON do IBGE
const BASE_IBGE_URL = 'https://servicodados.ibge.gov.br/api/v3/malhas/municipios/';

// Cache para armazenar os dados GeoJSON dos municípios já consultados
const municipalityCache: Record<string, any> = {};

// Controle de timeout e retry para requisições
const REQUEST_TIMEOUT = 5000; // 5 segundos
const MAX_RETRIES = 2;

// Flag para modo offline (usar apenas dados em cache)
let offlineMode = false;

/**
 * Ativa ou desativa o modo offline
 * No modo offline, apenas dados em cache serão usados
 */
export function setOfflineMode(enabled: boolean): void {
  offlineMode = enabled;
  console.log(`Modo offline ${enabled ? 'ativado' : 'desativado'}`);
}

/**
 * Verifica se estamos em modo offline
 */
export function isOfflineMode(): boolean {
  return offlineMode;
}

/**
 * Função auxiliar que faz requisições com retry e timeout
 */
async function makeRequestWithRetry(
  url: string, 
  options: any = {}, 
  retries = MAX_RETRIES
): Promise<any> {
  // Se não estamos no navegador, retorna erro imediatamente
  if (!isBrowser) {
    throw new Error('Requisições só podem ser feitas no ambiente do navegador');
  }
    
  try {
    // Se estiver em modo offline, não tenta fazer requisições
    if (offlineMode) {
      throw new Error('Aplicação está em modo offline');
    }

    const response = await axios.get(url, {
      ...options,
      timeout: REQUEST_TIMEOUT,
    });
    
    return response.data;
  } catch (error: any) {
    // Se for a última tentativa, ou erro for de bloqueio da API, ativa modo offline
    if (retries <= 0 || (error.response && error.response.status === 403)) {
      // Se encontramos erros repetidos, vamos ativar o modo offline automaticamente
      if (!offlineMode) {
        console.warn('Ativando modo offline devido a erros de conectividade');
        setOfflineMode(true);
      }
      throw error;
    }
    
    console.warn(`Erro na requisição, tentando novamente (${retries} tentativas restantes)...`);
    // Aguarda um tempo antes de tentar novamente (backoff exponencial)
    const delay = Math.pow(2, MAX_RETRIES - retries) * 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Tenta novamente
    return makeRequestWithRetry(url, options, retries - 1);
  }
}

/**
 * Obtém o código do município com base na latitude e longitude
 * usando serviço de geocodificação reversa do Nominatim (OpenStreetMap)
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns Código IBGE do município ou null se não encontrado
 */
export async function getMunicipalityCode(lat: number, lng: number): Promise<string | null> {
  // Se não estamos no navegador, retorna null
  if (!isBrowser) {
    console.log('getMunicipalityCode: executando no servidor, retornando null');
    return null;
  }
  
  try {
    // Se estamos em modo offline, não fazer requisições
    if (offlineMode) {
      console.log('Modo offline ativo, pulando requisição de geocodificação');
      return null;
    }
    
    // Usando Nominatim (OpenStreetMap) para reverse geocoding
    const data = await makeRequestWithRetry(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Papo-Social-App/1.0',
        },
      }
    );

    // Extrai o código IBGE do município (geralmente disponível nas propriedades)
    if (data && data.address) {
      // Tenta extrair o código do município das propriedades
      const municipalityCode = data.address.city_code || 
                               data.address.town_code ||
                               null;
      
      // Se não encontrarmos diretamente, podemos fazer uma consulta adicional
      // para obter o código IBGE com base no nome do município
      if (!municipalityCode && data.address.city) {
        // Implementação de fallback - consulta baseada no nome
        return getMunicipalityCodeByName(data.address.city);
      }
      
      return municipalityCode;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter código do município:', error);
    // Em caso de falha, ativamos o modo offline para evitar mais requisições
    setOfflineMode(true);
    return null;
  }
}

/**
 * Função auxiliar para obter o código IBGE de um município pelo nome
 * Esta função precisaria ser implementada com uma lista de mapeamento 
 * de nomes para códigos IBGE
 * 
 * @param name Nome do município
 * @returns Código IBGE do município ou null
 */
function getMunicipalityCodeByName(name: string): string | null {
  // Versão simplificada com alguns códigos de grandes cidades
  // Em um projeto real, você teria um mapeamento completo
  const cityMapping: Record<string, string> = {
    'rio de janeiro': '3304557',
    'são paulo': '3550308',
    'belo horizonte': '3106200',
    'brasília': '5300108',
    'salvador': '2927408',
    'recife': '2611606',
    'fortaleza': '2304400',
    'curitiba': '4106902',
    'manaus': '1302603',
    'porto alegre': '4314902'
  };
  
  // Normaliza o nome da cidade para busca
  const normalizedName = name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  const code = cityMapping[normalizedName];
  
  if (!code) {
    console.warn(`Mapeamento de nome para código do município não encontrado para: ${name}`);
  }
  
  return code || null;
}

/**
 * Obtém os dados GeoJSON de um município pelo seu código IBGE
 * 
 * @param municipalityCode Código IBGE do município
 * @returns Dados GeoJSON do município ou null se não encontrado
 */
export async function getMunicipalityGeoJSON(municipalityCode: string): Promise<any | null> {
  // Se não estamos no navegador, retorna null
  if (!isBrowser) {
    console.log('getMunicipalityGeoJSON: executando no servidor, retornando null');
    return null;
  }
  
  // Verifica se já temos os dados em cache
  if (municipalityCache[municipalityCode]) {
    console.log(`Utilizando dados em cache para o município ${municipalityCode}`);
    return municipalityCache[municipalityCode];
  }
  
  // Se estamos em modo offline e não temos o dado em cache, retorna null
  if (offlineMode) {
    console.log('Modo offline ativo, pulando requisição de dados GeoJSON');
    return null;
  }
  
  try {
    // Neste exemplo, usamos a API do IBGE para obter os limites geográficos
    const data = await makeRequestWithRetry(
      `${BASE_IBGE_URL}${municipalityCode}?formato=application/vnd.geo+json`
    );
    
    // Salva no cache para futuras requisições
    if (data) {
      municipalityCache[municipalityCode] = data;
      return data;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao obter dados GeoJSON do município ${municipalityCode}:`, error);
    // Em caso de falha, ativamos o modo offline para evitar mais requisições
    setOfflineMode(true);
    return null;
  }
}

/**
 * Obtém os dados do município com base na localização do usuário
 * 
 * @param location Localização do usuário
 * @returns Dados GeoJSON do município ou null se não encontrado
 */
export async function getMunicipalityDataByLocation(location: UserLocation): Promise<any | null> {
  // Se não estamos no navegador, retorna null
  if (!isBrowser) {
    console.log('getMunicipalityDataByLocation: executando no servidor, retornando null');
    return null;
  }
  
  if (!location.lat || !location.lng) {
    console.log('Localização do usuário inválida, não é possível obter dados do município');
    return null;
  }
  
  try {
    // Obtém o código do município
    const municipalityCode = await getMunicipalityCode(location.lat, location.lng);
    
    // Se não encontrar o código, retorna null
    if (!municipalityCode) {
      console.log('Não foi possível determinar o código do município, funcionando com localização simples');
      return null;
    }
    
    // Obtém os dados GeoJSON do município
    return getMunicipalityGeoJSON(municipalityCode);
  } catch (error) {
    console.error('Erro ao processar dados do município:', error);
    return null;
  }
} 