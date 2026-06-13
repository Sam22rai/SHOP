import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGjAXfR4HTgJiGT1zKC1UYQsBeU4Bt0",
  authDomain: "tinydreamscrafts.firebaseapp.com",
  projectId: "tinydreamscrafts",
  storageBucket: "tinydreamscrafts.firebasestorage.app",
  messagingSenderId: "1058904515145",
  appId: "1:1058904515145:web:b75dad5a64b9cd602e1598"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Save product details to Firestore
async function saveProductToFirebase(name, price, imageUrl) {
    try {
        await addDoc(collection(db, "products"), {
            name: name,
            price: price,
            image: imageUrl,
            timestamp: new Date()
        });
        return true;
    } catch (error) {
        console.error("Firestore Save Error:", error);
        return false;
    }
}

// Fetch products from Firebase (Now captures the Document ID too!)
async function getProductsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let productsArray = [];
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id; // 🔥 Storing the unique Firebase ID so we know which one to delete later
            productsArray.push(data);
        });
        return productsArray;
    } catch (error) {
        console.error("Firebase Fetch Error:", error);
        return [];
    }
}

// 🔥 NEW BRIDGE FUNCTION: Delete product from Firebase using its ID
async function deleteProductFromFirebase(productId) {
    try {
        await deleteDoc(doc(db, "products", productId));
        return true;
    } catch (error) {
        console.error("Firebase Delete Error:", error);
        return false;
    }
}

window.saveProductToFirebase = saveProductToFirebase;
window.getProductsFromFirebase = getProductsFromFirebase;
window.deleteProductFromFirebase = deleteProductFromFirebase;