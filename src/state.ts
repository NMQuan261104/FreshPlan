import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { weekStartISO } from './services/api';
import { AppData } from './types';

// Lưu cục bộ trên máy (chưa có backend). Không lưu mật khẩu/token.
const KEY = 'freshplan.v2';

export const initialData = (): AppData => ({
  inventory: [],
  portions: 2,
  allergies: [],
  weekStart: weekStartISO(),
  slots: {},
  savedPlan: undefined,
  checked: {},
});

export function useAppData() {
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw && alive) {
          const saved = JSON.parse(raw) as Partial<AppData>;
          const base = initialData();
          const merged: AppData = { ...base, ...saved };
          // Sang tuần mới -> bỏ kế hoạch tuần cũ, giữ kho + hồ sơ.
          if (saved.weekStart !== base.weekStart) Object.assign(merged, { weekStart: base.weekStart, slots: {}, savedPlan: undefined, checked: {} });
          setData(merged);
        }
      } catch {
        // dữ liệu hỏng / không đọc được -> bắt đầu trống
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  return { data, setData, ready };
}
