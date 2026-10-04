import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { s } from '../components/ui';
import { useAppData } from '../state';
import { Ingredient, Tab } from '../types';
import { colors, space, font } from '../theme';
import InventoryTab from './InventoryTab';
import RecipesTab from './RecipesTab';
import ScanFlow from './ScanFlow';
import ShoppingTab from './ShoppingTab';
import WeekTab from './WeekTab';

const TABS: [Tab, string][] = [['inventory', 'Kho'], ['recipes', 'Công thức'], ['week', 'Tuần'], ['shopping', 'Đi chợ']];

export default function MainTabs({ onLogout }: { onLogout: () => void }) {
  const { data, setData, ready } = useAppData();
  const [tab, setTab] = useState<Tab>('inventory');
  const [scanning, setScanning] = useState(false);
  const [started, setStarted] = useState(false); // false = màn đầu sau đăng nhập: chỉ chụp
  const [landingKey, setLandingKey] = useState(0);
  const applied = useRef(new Set<string>()); // scanId đã lưu -> xác nhận lặp không nhân đôi kho

  const addToInventory = (items: Ingredient[], scanId: string) => {
    const fromKho = started && tab === 'inventory'; // chụp từ tab Kho -> ở lại Kho để thấy kết quả
    if (applied.current.has(scanId)) return;
    applied.current.add(scanId);
    setData((d) => {
      const next = [...d.inventory];
      for (const it of items) {
        const idx = next.findIndex((x) => x.name.trim().toLowerCase() === it.name.toLowerCase() && x.unit === it.unit);
        if (idx >= 0) next[idx] = { ...next[idx], quantity: (next[idx].quantity ?? 0) + (it.quantity ?? 0), expiry: it.expiry ?? next[idx].expiry };
        else next.push(it);
      }
      return { ...d, inventory: next };
    });
    setScanning(false);
    setStarted(true);
    setTab(fromKho ? 'inventory' : 'recipes');
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg, paddingBottom: space.sm }}>
        <Text style={[s.h2, { color: colors.primary }]}>FRESHPLAN</Text>
        <Pressable onPress={onLogout} accessibilityRole="button" accessibilityLabel="Đăng xuất" style={{ minHeight: 48, justifyContent: 'center' }}>
          <Text style={{ color: colors.primary, fontFamily: font.semi }}>Admin · Đăng xuất</Text>
        </Pressable>
      </View>

      <ScrollView
        key={!started ? 'landing' : scanning ? 'scan' : tab} // đổi tab -> cuộn về đầu
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, paddingTop: space.sm, paddingBottom: space.xxl, maxWidth: 720, width: '100%', alignSelf: 'center' }}
      >
        {!ready ? (
          <View style={{ padding: space.xxl, alignItems: 'center' }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[s.muted, { marginTop: space.sm }]}>Đang tải dữ liệu…</Text>
          </View>
        ) : !started ? (
          <ScanFlow key={landingKey} landing onConfirm={addToInventory} onCancel={() => setLandingKey((k) => k + 1)} onSkip={data.inventory.length > 0 ? () => { setStarted(true); setTab('inventory'); } : undefined} />
        ) : scanning ? (
          <ScanFlow onConfirm={addToInventory} onCancel={() => setScanning(false)} />
        ) : tab === 'inventory' ? (
          <InventoryTab data={data} setData={setData} onScan={() => setScanning(true)} />
        ) : tab === 'recipes' ? (
          <RecipesTab data={data} setData={setData} onScan={() => { setScanning(true); setTab('inventory'); }} onGoInventory={() => setTab('inventory')} onGoWeek={() => setTab('week')} />
        ) : tab === 'week' ? (
          <WeekTab data={data} setData={setData} onSaved={() => setTab('shopping')} />
        ) : (
          <ShoppingTab data={data} setData={setData} onGoWeek={() => setTab('week')} />
        )}
      </ScrollView>

      {started && !scanning && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
          {TABS.map(([k, label]) => (
            <Pressable
              key={k}
              onPress={() => setTab(k)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: tab === k }}
              style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', borderTopWidth: 3, borderTopColor: tab === k ? colors.primary : 'transparent' }}
            >
              <Text style={{ color: tab === k ? colors.primary : colors.muted, fontFamily: tab === k ? font.bold : font.medium }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
