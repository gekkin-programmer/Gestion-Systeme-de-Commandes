import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { typography } from '../../constants/tokens';

export function LanguageToggle() {
  const { language, setLanguage } = useSettingsStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setLanguage('EN')}
        style={[styles.option, language === 'EN' && styles.activeOption]}
      >
        <Text style={[styles.text, language === 'EN' && styles.activeText]}>EN</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setLanguage('FR')}
        style={[styles.option, language === 'FR' && styles.activeOption]}
      >
        <Text style={[styles.text, language === 'FR' && styles.activeText]}>FR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 24,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 4,
    elevation: 8,
    shadowColor: '#FF8383',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 131, 131, 0.15)',
    zIndex: 999, // Ensure it's clickable above absolute elements
  },
  option: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeOption: {
    backgroundColor: '#FF8383',
  },
  text: {
    fontFamily: typography.rubikMedium,
    fontSize: 12,
    color: '#9E9E9E',
  },
  activeText: {
    color: '#FFFFFF',
    fontFamily: typography.rubikSemiBold,
  },
});
