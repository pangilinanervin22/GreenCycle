import { Button, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthStore } from '@/lib/AuthStore';
import { router } from 'expo-router';


export default function TabOneScreen() {


  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/login'); // Redirect to login after logout
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/* Add a logout button here */}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
