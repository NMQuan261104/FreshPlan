import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, Field, s } from '../components/ui';
import { colors, space } from '../theme';

// Tạm thời chỉ có tài khoản admin (mock). Sau này thay bằng Supabase Auth.
const ADMIN = { email: 'admin@freshplan.local', password: 'admin123' };

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  const submit = () => {
    if (email.trim().toLowerCase() === ADMIN.email && password === ADMIN.password) {
      setError(undefined);
      onLogin();
    } else setError('Email hoặc mật khẩu không đúng. Thử admin@freshplan.local / admin123.');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: space.lg, maxWidth: 440, width: '100%', alignSelf: 'center' }}>
      <Text style={[s.h1, { color: colors.primary }]}>FRESHPLAN</Text>
      <Text style={[s.muted, { marginBottom: space.xl }]}>Từ ảnh tủ lạnh đến bữa ăn mỗi ngày</Text>
      <Card>
        <Text style={[s.h2, { marginBottom: space.md }]}>Đăng nhập Admin</Text>
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="admin@freshplan.local" />
        <Field label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" onSubmitEditing={submit} error={error} />
        <Button label="Đăng nhập" onPress={submit} />
      </Card>
    </View>
  );
}
