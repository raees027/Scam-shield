import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function scanEntry(value: string, type: string) {
  const res = await axios.post(`${API_URL}/api/scan`, { value, type });
  return res.data;
}

export async function getRecentReports() {
  const res = await axios.get(`${API_URL}/api/reports/recent`);
  return res.data;
}
export async function submitReport(value: string, type: string, description: string) {
  const res = await axios.post(`${API_URL}/api/report`, { value, type, description });
  return res.data;
}
export async function getStats() {
  const res = await axios.get(`${API_URL}/api/stats`);
  return res.data;
}