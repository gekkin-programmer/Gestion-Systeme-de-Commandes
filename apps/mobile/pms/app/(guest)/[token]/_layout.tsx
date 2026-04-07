import { Stack } from 'expo-router';
import { colors } from '../../../constants/tokens';

export default function GuestStayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[dept]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="requests" />
      <Stack.Screen name="tracking/[requestId]" />
    </Stack>
  );
}
