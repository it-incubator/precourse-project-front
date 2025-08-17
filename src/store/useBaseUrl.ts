import { useEffect, useState } from "react";

const KEY = "projects_base_url";

export function getStoredBaseUrl(): string {
  return localStorage.getItem(KEY) || "";
}

export function setStoredBaseUrl(url: string) {
  localStorage.setItem(KEY, url);
}

export function useBaseUrl() {
  const [baseUrl, setBaseUrl] = useState<string>(() => getStoredBaseUrl());
  useEffect(() => { setStoredBaseUrl(baseUrl); }, [baseUrl]);
  return { baseUrl, setBaseUrl };
}
