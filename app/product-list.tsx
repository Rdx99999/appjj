import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PRODUCTS = [
  { id: '1', name: 'Red Tomato', weight: '500mg', price: '65', discount: '30% off', seller: 'Sakib' },
  { id: '2', name: 'Sweet Pumpkin', weight: '1 km', price: '50', discount: '10% off', seller: 'Romin' },
  { id: '3', name: 'The Carrot', weight: '500mg', price: '70', seller: 'Mahfuz' },
  { id: '4', name: 'Dimond Potato', weight: '1 km', price: '80', seller: 'Samsul' },
];

export default function ProductListScreen() {
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

       <Text style={styles.title}>Vegetables</Text>

       <FlatList
          data={PRODUCTS}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
               {item.discount && (
                 <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                 </View>
               )}
               <Image source={require('../assets/images/partial-react-logo.png')} style={styles.productImage} />
               <Text style={styles.productName}>{item.name}</Text>
               <Text style={styles.productWeight}>Quantity: {item.weight}</Text>
               <Text style={styles.productPrice}>Price: {item.price} <Text style={{fontSize: 10}}>BDT</Text></Text>
               
               <View style={styles.footer}>
                  <View style={styles.sellerInfo}>
                     <Image source={require('../assets/images/favicon.png')} style={styles.sellerAvatar} />
                     <View>
                        <Text style={styles.sellerName}>{item.seller}</Text>
                        <Text style={styles.shopId}>ID: XYZ</Text>
                     </View>
                  </View>
                  <TouchableOpacity style={styles.addBtn}>
                     <IconSymbol name="plus" size={16} color={COLORS.white} />
                  </TouchableOpacity>
               </View>
            </View>
          )}
          contentContainerStyle={styles.list}
       />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, marginHorizontal: 15, paddingHorizontal: 10, height: 40 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  list: { paddingBottom: 20 },
  card: { flex: 1, backgroundColor: COLORS.white, margin: 5, borderRadius: 15, padding: 10, borderWidth: 1, borderColor: '#F0F0F0' },
  discountBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.secondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
  discountText: { fontSize: 10, fontWeight: 'bold', color: COLORS.white },
  productImage: { width: '100%', height: 100, resizeMode: 'contain', marginBottom: 10 },
  productName: { fontSize: 14, fontWeight: 'bold' },
  productWeight: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  sellerInfo: { flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 5 },
  sellerName: { fontSize: 11, fontWeight: 'bold' },
  shopId: { fontSize: 9, color: COLORS.textSecondary },
  addBtn: { backgroundColor: COLORS.primary, width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }
});
