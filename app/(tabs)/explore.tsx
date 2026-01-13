import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const CATEGORIES = [
  { id: '1', name: 'Vegetables', image: require('../../assets/images/partial-react-logo.png') },
  { id: '2', name: 'Fruits', image: require('../../assets/images/partial-react-logo.png') },
  { id: '3', name: 'Fish', image: require('../../assets/images/partial-react-logo.png') },
  { id: '4', name: 'Meat', image: require('../../assets/images/partial-react-logo.png') },
];

export default function CategoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
          <TouchableOpacity>
             <IconSymbol name="chevron.left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
             <IconSymbol name="magnifyingglass" size={18} color={COLORS.textSecondary} />
             <TextInput placeholder="Search your product" style={styles.searchInput} />
          </View>
          <TouchableOpacity>
             <IconSymbol name="cart" size={24} color={COLORS.text} />
          </TouchableOpacity>
       </View>

       <Text style={styles.title}>All category</Text>

       <FlatList
          data={CATEGORIES}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
               <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.image} />
               </View>
               <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
       />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, marginHorizontal: 15, paddingHorizontal: 10, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  list: { paddingBottom: 20 },
  card: { flex: 1, backgroundColor: '#F2F9F3', margin: 8, borderRadius: 15, padding: 15, alignItems: 'center' },
  imageContainer: { width: '100%', height: 100, marginBottom: 10 },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  catName: { fontSize: 16, fontWeight: '600' }
});
