
export type EntityType = 'WIFI' | 'BLUETOOTH' | 'NFC' | 'RFID' | 'EXT_IF' | 'VHF' | 'UHF' | 'PACKET';

export type AppView = 'RADAR' | 'HAM' | 'URH' | 'LOGBOOK' | 'SOPHIA' | 'SETTINGS' | 'ENV_3D' | 'PACKET_SENTINEL' | 'NEURAL_FIELD' | 'INTERCEPT_JOURNAL' | 'REMOTE_EXPLORER';

export interface DetectedEntity {
  id: string;
  type: EntityType;
  name: string;
  identifier: string; // MAC, SSID, UUID, or Frequency
  strength: number; // dBm
  distance: number; // meters
  security?: 'OPEN' | 'WPA2' | 'WPA3' | 'WEP' | 'ENCRYPTED' | 'UNSECURED' | 'ANALOG' | 'DMR';
  riskScore: number; // 0-100
  bearing: number; // 0-359
  frequency?: number; // MHz
  timestamp: number;
  tags: string[];
  isReal?: boolean;
  isExternal?: boolean; 
  notes?: string;
  bssid?: string; // For Wi-Fi Audit
}

export interface IntelLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'AI';
}

export interface InterceptLog {
  id: string;
  timestamp: number;
  mac: string;
  ip: string;
  target: string; // What they are searching/doing
  protocol: string;
  dataPayload: string;
  screenshot?: string; // Data URL for simulated visual capture
}

export interface RemoteFile {
  name: string;
  type: 'FILE' | 'FOLDER';
  size?: string;
  modified: string;
  permissions: string;
}

export interface SophiaIntel {
  summary: string;
  threatAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export interface RadioState {
  frequency: number; // In MHz
  mode: 'LSB' | 'USB' | 'AM' | 'FM' | 'CW' | 'DMR';
  bandwidth: 'NOR' | 'NAR' | 'WIDE';
  squelch: number;
  gain: number;
  memory: string[];
}
