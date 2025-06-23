let isAdmin = false;
let products = [
  { id: 1, title: 'T-Shirt', price: '$20', description: 'Comfortable cotton T-shirt', image: 'data:image/png;base64,' },
  { id: 2, title: 'Cap', price: '$15', description: 'Stylish summer cap', image: 'data:image/png;base64,' },
  { id: 3, title: 'Sneakers', price: '$50', description: 'Durable running sneakers', image: 'data:image/png;base64,' },
];

// Load products from localStorage if available
const loadProductsFromStorage = () => {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    products = JSON.parse(storedProducts);
  }
};

// Function to load products
const loadProducts = () => {
  loadProductsFromStorage(); // Load saved products

  const container = document.getElementById('productContainer');
  container.innerHTML = ''; // Clear previous content

  products.forEach((product, index) => {
    const div = document.createElement('div');
    div.className = 'product';

    const img = document.createElement('img');
    img.src = product.image;
    img.id = `image-${product.id}`;
    img.onclick = () => {
      if (isAdmin) {
        triggerFileInput(product.id); // Only admin can trigger file input
      }
    };

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = `file-input-${product.id}`;
    fileInput.style.display = 'none';
    fileInput.onchange = (e) => handleFileSelect(e, product.id);

    const title = document.createElement('h3');
    title.textContent = product.title;
    title.contentEditable = isAdmin;

    const price = document.createElement('p');
    price.textContent = product.price;
    price.contentEditable = isAdmin;

    const desc = document.createElement('textarea');
    desc.value = product.description;
    desc.disabled = !isAdmin;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.display = isAdmin ? 'block' : 'none';
    saveBtn.onclick = () => saveProduct(product.id, title, price, desc);

    div.append(img, fileInput, title, price, desc, saveBtn);
    container.appendChild(div);
  });
};

// Trigger file input when image is clicked
const triggerFileInput = (id) => {
  const fileInput = document.getElementById(`file-input-${id}`);
  fileInput.click(); // Open file explorer
};

// Handle file selection and update the image
const handleFileSelect = async (event, id) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const base64 = await convertToBase64(file);
    const product = products.find((p) => p.id === id);
    product.image = base64; // Update product image
    document.getElementById(`image-${id}`).src = base64; // Update image element
    saveToLocalStorage(); // Save the updated products to localStorage
    alert('Image updated!');
  }
};

// Convert file to base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Save product data to localStorage
const saveProduct = (id, titleElement, priceElement, descElement) => {
  const product = products.find((p) => p.id === id);
  product.title = titleElement.textContent;
  product.price = priceElement.textContent;
  product.description = descElement.value;

  saveToLocalStorage(); // Save to localStorage
  console.log('Product saved:', product);
  alert('Product saved!');
};

// Save products array to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem('products', JSON.stringify(products));
};

// Admin login
document.getElementById('adminLogin').addEventListener('click', () => {
  const password = prompt('Enter admin password:');
  if (password === 'admin123') {
    isAdmin = true;
    document.getElementById('adminLogin').style.display = 'none'; // Hide the login button
    loadProducts(); // Load products with admin features enabled
  } else {
    alert('Wrong password!');
  }
});

// Load products on page load
window.onload = loadProducts;
