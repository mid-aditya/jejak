import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../config/theme';
import { EmptyState } from '../../shared/components/ui';

const TripDetailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="terrain"
        title="Detail Trip"
        message="Detail pendakian akan tersedia setelah fitur ini terhubung ke server."
        actionLabel="Kembali"
        onAction={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
});

export default TripDetailScreen;
