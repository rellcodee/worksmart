import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants/theme';

const QUOTES = [
  {
    text: "It's better to feel the hardship of learning than to endure the pain of ignorance.",
    author: "Imam Shafi'i"
  },
  {
    text: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein"
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci"
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  }
];

export function QuotesCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % QUOTES.length);
    }, 10000); // 10 seconds auto-rotation

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 1) % QUOTES.length);
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex - 1 + QUOTES.length) % QUOTES.length);
  };

  const currentQuote = QUOTES[index];

  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        <TouchableOpacity onPress={handlePrev} style={styles.navButton} activeOpacity={0.7}>
          <IconSymbol size={20} name="chevron.right" color={theme.colors.textMuted} style={styles.rotateIconLeft} />
        </TouchableOpacity>

        <View style={styles.quoteWrapper}>
          <Text style={styles.quoteText}>“{currentQuote.text}”</Text>
          <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.navButton} activeOpacity={0.7}>
          <IconSymbol size={20} name="chevron.right" color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.indicatorRow}>
        {QUOTES.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.indicator,
              idx === index ? styles.indicatorActive : null
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  quoteWrapper: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    color: theme.colors.text,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: theme.fonts.sans,
  },
  quoteAuthor: {
    color: theme.colors.claude,
    fontSize: 12,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    fontFamily: theme.fonts.sans,
  },
  navButton: {
    padding: theme.spacing.xs,
  },
  rotateIconLeft: {
    transform: [{ rotate: '180deg' }], // Turn "chevron right" icon to face left
  },
  indicatorRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: 3,
  },
  indicatorActive: {
    width: 14,
    backgroundColor: theme.colors.claude,
  },
});

export default QuotesCarousel;
