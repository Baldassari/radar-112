import type { OcorrenciasSource } from './types';
import { MockOcorrenciasSource } from './mock/source';
import { RemoteOcorrenciasSource } from './remote/source';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const ocorrenciasSource: OcorrenciasSource = baseUrl
  ? new RemoteOcorrenciasSource(baseUrl)
  : new MockOcorrenciasSource();

export * from './types';
