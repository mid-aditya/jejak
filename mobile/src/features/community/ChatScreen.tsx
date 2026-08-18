import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../config/theme';
import { EmptyState } from '../../shared/components/ui';

interface ChatRouteParams {
  team?: { title?: string; host?: string };
  threadId?: string;
}

const ChatScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const params = route.params as ChatRouteParams | undefined;
  const title = params?.team?.title ?? 'Chat';

  return (
    <View style={styles.container}>
      <EmptyState
        icon="chat-bubble-outline"
        title={title}
        message="Obrolan grup akan tersedia setelah fitur chat terhubung ke server."
        actionLabel="Kembali"
        onAction={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
});

export default ChatScreen;
