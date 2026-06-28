import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function scanEntry(value: string, type: string) {
  const res = await axios.post(`${API_URL}/api/scan`, { value, type });
  return res.data;
}