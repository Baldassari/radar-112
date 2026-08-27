import type { Estado, Nivel } from '../types';

/** Coordenadas de concelho (fictícias na escolha, reais na posição) para os
 * 18 distritos de Portugal continental — mesmo nível de precisão do
 * protótipo (README: "posições reais de concelho; ocorrências... inventados"). */
export const DISTRITOS: {
  nome: string;
  concelhos: { concelho: string; freguesia: string; lat: number; lon: number }[];
}[] = [
  { nome: 'Aveiro', concelhos: [
    { concelho: 'Aveiro', freguesia: 'Glória e Vera Cruz', lat: 40.6443, lon: -8.6455 },
    { concelho: 'Ovar', freguesia: 'Válega', lat: 40.8628, lon: -8.6255 },
    { concelho: 'Águeda', freguesia: 'Águeda e Borralha', lat: 40.5738, lon: -8.4478 },
  ] },
  { nome: 'Beja', concelhos: [
    { concelho: 'Beja', freguesia: 'Salvador', lat: 38.015, lon: -7.8632 },
    { concelho: 'Odemira', freguesia: 'São Teotónio', lat: 37.5967, lon: -8.6389 },
  ] },
  { nome: 'Braga', concelhos: [
    { concelho: 'Braga', freguesia: 'São Vicente', lat: 41.5454, lon: -8.4265 },
    { concelho: 'Guimarães', freguesia: 'Azurém', lat: 41.4425, lon: -8.2918 },
    { concelho: 'Barcelos', freguesia: 'Barcelinhos', lat: 41.5388, lon: -8.6151 },
  ] },
  { nome: 'Bragança', concelhos: [
    { concelho: 'Bragança', freguesia: 'Sé', lat: 41.8073, lon: -6.7569 },
    { concelho: 'Mirandela', freguesia: 'Mirandela', lat: 41.4877, lon: -7.1826 },
  ] },
  { nome: 'Castelo Branco', concelhos: [
    { concelho: 'Castelo Branco', freguesia: 'Castelo Branco', lat: 39.8222, lon: -7.4909 },
    { concelho: 'Covilhã', freguesia: 'Covilhã e Canhoso', lat: 40.2807, lon: -7.5079 },
  ] },
  { nome: 'Coimbra', concelhos: [
    { concelho: 'Coimbra', freguesia: 'Sé Nova', lat: 40.2033, lon: -8.4103 },
    { concelho: 'Figueira da Foz', freguesia: 'Figueira da Foz', lat: 40.1508, lon: -8.8622 },
    { concelho: 'A1 · km 213', freguesia: 'A1 · km 213', lat: 40.05, lon: -8.55 },
  ] },
  { nome: 'Évora', concelhos: [
    { concelho: 'Évora', freguesia: 'Sé e São Pedro', lat: 38.5667, lon: -7.9 },
    { concelho: 'Montemor-o-Novo', freguesia: 'Montemor-o-Novo', lat: 38.6489, lon: -8.2178 },
  ] },
  { nome: 'Faro', concelhos: [
    { concelho: 'Faro', freguesia: 'Sé', lat: 37.0194, lon: -7.9322 },
    { concelho: 'Loulé', freguesia: 'Quarteira', lat: 37.0703, lon: -8.1015 },
    { concelho: 'Portimão', freguesia: 'Portimão', lat: 37.1364, lon: -8.5384 },
  ] },
  { nome: 'Guarda', concelhos: [
    { concelho: 'Guarda', freguesia: 'Sé', lat: 40.5364, lon: -7.2683 },
    { concelho: 'Seia', freguesia: 'Seia', lat: 40.4189, lon: -7.7036 },
  ] },
  { nome: 'Leiria', concelhos: [
    { concelho: 'Leiria', freguesia: 'Marrazes', lat: 39.7436, lon: -8.8071 },
    { concelho: 'A1 · km 108', freguesia: 'A1 · km 108', lat: 39.85, lon: -8.75 },
    { concelho: 'Pombal', freguesia: 'Pombal', lat: 39.9161, lon: -8.6289 },
  ] },
  { nome: 'Lisboa', concelhos: [
    { concelho: 'Lisboa', freguesia: 'Arroios', lat: 38.7223, lon: -9.1393 },
    { concelho: 'Sintra', freguesia: 'Agualva e Mira-Sintra', lat: 38.8029, lon: -9.3817 },
    { concelho: 'Amadora', freguesia: 'Falagueira-Venda Nova', lat: 38.7536, lon: -9.2302 },
  ] },
  { nome: 'Portalegre', concelhos: [
    { concelho: 'Portalegre', freguesia: 'Sé', lat: 39.2967, lon: -7.4281 },
    { concelho: 'Elvas', freguesia: 'Elvas', lat: 38.8807, lon: -7.1631 },
  ] },
  { nome: 'Porto', concelhos: [
    { concelho: 'Porto', freguesia: 'Bonfim', lat: 41.1579, lon: -8.6291 },
    { concelho: 'Vila Nova de Gaia', freguesia: 'Santa Marinha', lat: 41.1239, lon: -8.6118 },
    { concelho: 'Matosinhos', freguesia: 'Matosinhos e Leça da Palmeira', lat: 41.1813, lon: -8.6879 },
  ] },
  { nome: 'Santarém', concelhos: [
    { concelho: 'Santarém', freguesia: 'Marvila', lat: 39.2369, lon: -8.6858 },
    { concelho: 'Tomar', freguesia: 'Tomar', lat: 39.6033, lon: -8.4103 },
  ] },
  { nome: 'Setúbal', concelhos: [
    { concelho: 'Setúbal', freguesia: 'São Sebastião', lat: 38.5244, lon: -8.8882 },
    { concelho: 'Almada', freguesia: 'Costa da Caparica', lat: 38.6489, lon: -9.2372 },
  ] },
  { nome: 'Viana do Castelo', concelhos: [
    { concelho: 'Viana do Castelo', freguesia: 'Monserrate', lat: 41.6932, lon: -8.833 },
    { concelho: 'Ponte de Lima', freguesia: 'Ponte de Lima', lat: 41.7708, lon: -8.5836 },
  ] },
  { nome: 'Vila Real', concelhos: [
    { concelho: 'Vila Real', freguesia: 'São Pedro', lat: 41.3006, lon: -7.7441 },
    { concelho: 'Chaves', freguesia: 'Chaves', lat: 41.7396, lon: -7.4694 },
  ] },
  { nome: 'Viseu', concelhos: [
    { concelho: 'Viseu', freguesia: 'Coração de Jesus', lat: 40.6566, lon: -7.9122 },
    { concelho: 'Lamego', freguesia: 'Lamego', lat: 41.0967, lon: -7.8106 },
  ] },
];

export const TIPOS = ['Acidente rodoviário', 'Salvamento', 'Emergência médica'] as const;

export const SUBTIPOS: Record<(typeof TIPOS)[number], string[]> = {
  'Acidente rodoviário': ['Colisão múltipla, 6 viaturas', 'Despiste de viatura', 'Colisão frontal, 2 viaturas', 'Atropelamento'],
  Salvamento: ['Resgate em zona rural', 'Buscas e salvamento', 'Pessoa encarcerada'],
  'Emergência médica': ['Mal súbito na via pública', 'Emergência médica', 'Intoxicação'],
};

export const NIVEIS: Nivel[] = ['vermelho', 'laranja', 'amarelo'];

export const ESTADOS_ATIVOS: Estado[] = ['Despacho', 'Em Curso', 'Chegada ao TO', 'Em Resolução', 'Em Conclusão', 'Vigilância'];

export const ENTIDADES = ['Bombeiros Voluntários', 'INEM', 'GNR', 'PSP', 'Proteção Civil Municipal', 'Cruz Vermelha'];

export const FONTES_IMPRENSA = ['Jornal de Notícias', 'Público', 'CM Jornal', 'Rádio Renascença', 'Observador'];

let seq = 100;
export function nextId(): string {
  seq += 1;
  return `RD-2026-${String(8000 + seq).padStart(5, '0')}`;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function jitter(v: number, amount: number): number {
  return v + (Math.random() - 0.5) * amount;
}
