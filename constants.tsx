import React from 'react';
import { Shield, Radio, Activity, Terminal, Map, List, MessageSquare, Bluetooth, Nfc, Wifi, Usb, Zap, Waves } from 'lucide-react';

export const SYSTEM_NAME = "MIDDLEMAN v1.4.2";
export const RECON_UNIT = "INTEL_NODE_08";

export const ICONS = {
  Shield: <Shield size={16} />,
  Radio: <Radio size={16} />,
  Activity: <Activity size={16} />,
  Terminal: <Terminal size={16} />,
  Map: <Map size={16} />,
  List: <List size={16} />,
  Message: <MessageSquare size={16} />,
  Bluetooth: <Bluetooth size={14} />,
  Nfc: <Nfc size={14} />,
  Wifi: <Wifi size={14} />,
  Usb: <Usb size={14} />,
  Zap: <Zap size={14} />,
  Ham: <Waves size={14} />
};

export const MOCK_SSIDS = [
  "Shadow_Net", "Starlink_99", "Public_WiFi", "Secure_Vault", 
  "HP_Printer_4A2", "FBI_Surveillance_Van", "Tesla_Guest", 
  "Guest_Access", "Dark_Sector", "Home_WiFi", "Netgear_88"
];

export const MOCK_BT_NAMES = [
  "WH-1000XM4", "Apple Watch", "Operative_Phone", "OBDII_Scanner",
  "TILE_TRACKER", "LE_Audio_01", "SmartLock_B4", "HID_Keyboard"
];

export const MOCK_NFC_TAGS = [
  "Transit_Pass", "Credit_Card_EMV", "Employee_Badge", "Amiibo_Sim",
  "Passive_Sensor", "Crypto_Wallet_Cold", "Hotel_Key_Mifare"
];

export const MOCK_RADIO_CHANNELS = [
  "EMERGENCY_CH_1", "TACTICAL_VHF_09", "LOCAL_REPEATER", "PMR_CH_08",
  "POLICE_DISPATCH_SIM", "AIR_TRAFFIC_MON", "HAM_CALL_SIGN_K7", "BAOFENG_UNIT_A"
];

// Alfa Cards often use Realtek chips
export const ALFA_VENDOR_IDS = [
  0x0BDA, // Realtek
  0x0E8D, // MediaTek
  0x148F  // Ralink
];
