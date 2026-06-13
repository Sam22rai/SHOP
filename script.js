// 1. WhatsApp Redirection
function orderNow(){
    window.open(
        "https://wa.me/919760006586?text=Hello%20I%20want%20to%20order",
        "_blank"
    );
}

// 2. Admin Login
function login(){
    let pass = document.getElementById("password").value;
    if(pass == "1234"){
        window.location.href = "admin.html";
    } else {
        alert("Wrong password");
    }
}

// 3. Add Product (Uploads to Imgbb, then saves link to Firebase)
async function addProduct(){
    let name = document.getElementById("productName").value;
    let price = document.getElementById("productPrice").value;
    let imageFileInput = document.getElementById("productImage");
    let imageFile = imageFileInput.files[0];

    if (!name || !price || !imageFile) {
        alert("Please fill out all fields and select an image file!");
        return;
    }

    alert("Uploading image to cloud storage... Please wait.");

    let formData = new FormData();
    formData.append("image", imageFile);

    let imgbbApiKey = "ad6e6aa6f7d2a692653abfa1249fbabd"; // ⚠️ REMEMBER TO PUT YOUR IMGBB API KEY HERE AGAIN!

    try {
        let response = await fetch("https://api.imgbb.com/1/upload?key=" + imgbbApiKey, {
            method: "POST",
            body: formData
        });

        let result = await response.json();

        if (result.success) {
            let uploadedImageUrl = result.data.url; 

            if (typeof window.saveProductToFirebase === "function") {
                let firebaseSuccess = await window.saveProductToFirebase(name, price, uploadedImageUrl);
                
                if (firebaseSuccess) {
                    alert("🎉 Success! Product & Real Image uploaded to the Cloud!");
                    document.getElementById("productName").value = "";
                    document.getElementById("productPrice").value = "";
                    imageFileInput.value = "";
                    
                    // Refresh the admin dashboard display list automatically!
                    displayAdminProducts();
                } else {
                    alert("Image uploaded, but saving to Firebase Database failed.");
                }
            }
        } else {
            alert("Image upload failed. Double check your Imgbb API key.");
        }
    } catch (error) {
        console.error("Upload Error:", error);
        alert("An error occurred during the upload process.");
    }
}

// 4. Display Products on Customer Homepage
async function displayProducts() {
    let productList = document.getElementById("productList");
    if (!productList) return; 

    productList.innerHTML = ""; 
    let products = [];

    if (typeof window.getProductsFromFirebase === "function") {
        products = await window.getProductsFromFirebase();
    }

    if (products.length === 0) {
        productList.innerHTML = "<p>No custom creations added yet.</p>";
        return;
    }

    products.forEach(function(product) {
        let cardHtml = `
            <div class="card">
                <img src="${product.image}" onerror="this.src='https://placehold.co/180x150?text=Craft+Image'">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
            </div>
        `;
        productList.innerHTML += cardHtml;
    });
}

// 🔥 5. NEW FUNCTION: Display Products on Admin Panel Dashboard
async function displayAdminProducts() {
    let adminProductList = document.getElementById("adminProductList");
    if (!adminProductList) return; // Only run if we are looking at admin.html

    adminProductList.innerHTML = "<p>Loading active products...</p>"; 
    let products = [];

    if (typeof window.getProductsFromFirebase === "function") {
        products = await window.getProductsFromFirebase();
    }

    if (products.length === 0) {
        adminProductList.innerHTML = "<p>No active products listed in the cloud database.</p>";
        return;
    }

    adminProductList.innerHTML = ""; // Clear loader text

    products.forEach(function(product) {
        let cardHtml = `
            <div class="card" style="border: 2px solid #ff8fcf;">
                <img src="${product.image}" onerror="this.src='https://placehold.co/180x150?text=Craft+Image'">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <button onclick="deleteProduct('${product.id}')" style="background: #dc3545; padding: 8px 15px; margin-top: 10px; font-size: 13px;">Delete Product</button>
            </div>
        `;
        adminProductList.innerHTML += cardHtml;
    });
}

// 🔥 6. NEW FUNCTION: Delete action trigger
async function deleteProduct(productId) {
    if (confirm("Are you absolutely sure you want to permanently delete this product?")) {
        if (typeof window.deleteProductFromFirebase === "function") {
            let success = await window.deleteProductFromFirebase(productId);
            if (success) {
                alert("🗑️ Product deleted successfully!");
                displayAdminProducts(); // Refresh the list layout view instantly
            } else {
                alert("Could not delete item from Firebase.");
            }
        }
    }
}

// Run the setup functions immediately when pages land
document.addEventListener("DOMContentLoaded", function() {
    displayProducts();       // Fires on index.html
    displayAdminProducts();  // Fires on admin.html
});

// Bind triggers safely to global browser scope
window.addProduct = addProduct;
window.login = login;
window.orderNow = orderNow;
window.deleteProduct = deleteProduct;