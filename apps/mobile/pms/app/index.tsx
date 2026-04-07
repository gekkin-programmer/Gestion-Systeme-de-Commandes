import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors } from '../constants/tokens';

// ─── Pong Loader ──────────────────────────────────────────────────────────────

const TRACK_WIDTH  = 140;
const PADDLE_W     = 5;
const PADDLE_H     = 52;
const BALL_SIZE    = 10;
// Ball travels between inner edges of the two paddles
const BALL_TRAVEL  = TRACK_WIDTH - PADDLE_W * 2 - BALL_SIZE;

function PongLoader() {
  const ballX       = useRef(new Animated.Value(0)).current;
  const leftScaleY  = useRef(new Animated.Value(1)).current;
  const rightScaleY = useRef(new Animated.Value(1)).current;
  const ballScaleX  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const HIT_DURATION = 60;
    const TRAVEL       = 500;
    const PAUSE        = 40;

    const squishLeft = () =>
      Animated.sequence([
        Animated.timing(leftScaleY,  { toValue: 0.5, duration: HIT_DURATION, useNativeDriver: true }),
        Animated.timing(leftScaleY,  { toValue: 1,   duration: HIT_DURATION, useNativeDriver: true }),
      ]);

    const squishRight = () =>
      Animated.sequence([
        Animated.timing(rightScaleY, { toValue: 0.5, duration: HIT_DURATION, useNativeDriver: true }),
        Animated.timing(rightScaleY, { toValue: 1,   duration: HIT_DURATION, useNativeDriver: true }),
      ]);

    const stretchBall = () =>
      Animated.sequence([
        Animated.timing(ballScaleX, { toValue: 1.7, duration: 70, useNativeDriver: true }),
        Animated.timing(ballScaleX, { toValue: 1,   duration: 70, useNativeDriver: true }),
      ]);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([ squishLeft(), stretchBall() ]),
        Animated.delay(PAUSE),
        Animated.timing(ballX, { toValue: BALL_TRAVEL, duration: TRAVEL, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.parallel([ squishRight(), stretchBall() ]),
        Animated.delay(PAUSE),
        Animated.timing(ballX, { toValue: 0, duration: TRAVEL, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.pongWrap}>
      {/* Left paddle — fixed container so scaleY doesn't shift layout */}
      <View style={styles.paddleContainer}>
        <Animated.View style={[styles.paddle, { transform: [{ scaleY: leftScaleY }] }]} />
      </View>

      {/* Ball track */}
      <View style={styles.track}>
        <Animated.View style={[styles.ball, { transform: [{ translateX: ballX }, { scaleX: ballScaleX }] }]} />
      </View>

      {/* Right paddle — fixed container */}
      <View style={styles.paddleContainer}>
        <Animated.View style={[styles.paddle, { transform: [{ scaleY: rightScaleY }] }]} />
      </View>
    </View>
  );
}

// ─── Main splash ──────────────────────────────────────────────────────────────

const MIN_SPLASH_MS = 1500;

export default function SplashScreen() {
  const { user, guestSession, isHydrated, setHydrated } = useAuthStore();

  const minTimeReady = useRef(false);
  const storeReady   = useRef(false);
  const mountTime    = useRef(Date.now());

  const navigate = () => {
    if (!minTimeReady.current || !storeReady.current) return;
    const { user, guestSession } = useAuthStore.getState();
    if (guestSession) {
      router.replace(`/(guest)/${guestSession.stayToken}`);
    } else if (user) {
      router.replace(user.role === 'STAFF' ? '/(staff)/requests' : '/(admin)/dashboard');
    } else {
      router.replace('/(guest)/welcome');
    }
  };

  useEffect(() => {
    const elapsed   = Date.now() - mountTime.current;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    const t = setTimeout(() => { minTimeReady.current = true; navigate(); }, remaining);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!useAuthStore.getState().isHydrated) setHydrated();
    }, 500);
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      clearTimeout(timeout);
      setHydrated();
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    storeReady.current = true;
    navigate();
  }, [isHydrated]);

  return (
    <View style={styles.container}>
      <PongLoader />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pongWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: TRACK_WIDTH,
  },

  // Fixed-height wrapper — prevents scaleY from shifting layout
  paddleContainer: {
    width: PADDLE_W,
    height: PADDLE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paddle: {
    width: PADDLE_W,
    height: PADDLE_H,
    backgroundColor: colors.black,
    borderRadius: 2,
  },

  track: {
    flex: 1,
    height: BALL_SIZE,
    justifyContent: 'center',
  },
  ball: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: colors.orange,
  },

});
