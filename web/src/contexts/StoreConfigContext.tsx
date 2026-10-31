'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { defaultHomepageConfig, type HomepageConfig } from '@/config/homepageConfig';

interface StoreConfigContextType {
  config: HomepageConfig;
  loading: boolean;
  isRedirectToSchedule: boolean;
  scheduleUrl: string;
  reloadConfig: () => Promise<void>;
  updateConfig: (newConfig: HomepageConfig) => Promise<void>;
}

const DEFAULT_SCHEDULE_URL =
  process.env.NEXT_PUBLIC_SCHEDULE_URL || 'https://schedule.boki.nhatcuong.io.vn';

const StoreConfigContext = createContext<StoreConfigContextType>({
  config: defaultHomepageConfig,
  loading: true,
  isRedirectToSchedule: false,
  scheduleUrl: DEFAULT_SCHEDULE_URL,
  reloadConfig: async () => {},
  updateConfig: async () => {},
});

export function StoreConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getStoreConfig();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          ...data,
          scheduleUrl: data.scheduleUrl || DEFAULT_SCHEDULE_URL,
        }));
      }
    } catch (err) {
      console.error('Failed to load store config in StoreConfigProvider', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (newConfig: HomepageConfig) => {
    setConfig(newConfig);
    await adminService.updateStoreConfig(newConfig);
  };

  const isRedirectToSchedule = Boolean(config.redirectToSchedule);
  const scheduleUrl = config.scheduleUrl || DEFAULT_SCHEDULE_URL;

  return (
    <StoreConfigContext.Provider
      value={{
        config,
        loading,
        isRedirectToSchedule,
        scheduleUrl,
        reloadConfig: fetchConfig,
        updateConfig,
      }}
    >
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}

