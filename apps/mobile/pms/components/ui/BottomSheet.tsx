import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Sheet height as fraction of screen (default 0.6) */
  heightRatio?: number;
  style?: ViewStyle;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  heightRatio = 0.6,
  style,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { height: SCREEN_HEIGHT * heightRatio, transform: [{ translateY }] },
          style,
        ]}
      >
        {/* Gradient accent bar at top */}
        <LinearGradient
          colors={[colors.cherryRose, colors.royalPlum, colors.pacificCyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />

        {/* Drag handle */}
        <View style={styles.handle} />

        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 4, 10, 0.75)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: colors.lineBright,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 2,
  },
});
