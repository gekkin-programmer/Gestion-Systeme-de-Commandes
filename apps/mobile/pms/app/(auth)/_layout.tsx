import { Stack } from 'expo-router';
import { colors } from '../../constants/tokens';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
