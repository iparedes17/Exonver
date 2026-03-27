import { useState, useCallback } from 'react';
import { load, save } from '../utils/helpers';

// Forecast structure: { userId: { 'YYYY-MM': { target: number, note: string } } }
export function useForecast() {
  const [forecasts, setForecasts] = useState(() => load('exv_forecasts', {}));

  const setForecast = useCallback((userId, yearMonth, target, note='') => {
    setForecasts(prev => {
      const next = {
        ...prev,
        [userId]: {
          ...(prev[userId]||{}),
          [yearMonth]: { target: Number(target)||0, note, setAt: new Date().toISOString() },
        },
      };
      save('exv_forecasts', next);
      return next;
    });
  }, []);

  const getForecast = useCallback((userId, yearMonth) => {
    return forecasts[userId]?.[yearMonth] || { target:0, note:'' };
  }, [forecasts]);

  const getUserForecasts = useCallback((userId) => {
    return forecasts[userId] || {};
  }, [forecasts]);

  // Returns actual closed sales count for a user in a given month
  const getActual = useCallback((clients, userId, yearMonth) => {
    return clients.filter(c => {
      if (c.stageId !== 'cerrado') return false;
      const owned = !userId || c.ownerId === userId;
      if (!owned) return false;
      const closeEntry = (c.pipelineHistory||[]).filter(h=>h.to==='cerrado').slice(-1)[0];
      return closeEntry?.date?.startsWith(yearMonth);
    }).length;
  }, []);

  return { forecasts, setForecast, getForecast, getUserForecasts, getActual };
}
