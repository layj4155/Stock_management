const API_URL_PRODUCTS = `${CONFIG.API_BASE_URL}/products`;

async function loadProducts() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL_PRODUCTS, {
            headers: { 'x-auth-token': token }
        });
        const products = await res.json();

        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.unitPrice.toFixed(2)} RWF</td>
                <td>${(product.quantity * product.unitPrice).toFixed(2)} RWF</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editProduct('${product._id}', '${product.name}', ${product.quantity}, ${product.unitPrice}, '${product.mfgDate}', '${product.expDate}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('productId').value;
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const unitPrice = document.getElementById('unitPrice').value;
    const mfgDate = document.getElementById('mfgDate').value;
    const expDate = document.getElementById('expDate').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL_PRODUCTS}/${id}` : API_URL_PRODUCTS;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ name, quantity, unitPrice, mfgDate, expDate })
        });

        if (res.ok) {
            resetForm();
            loadProducts();
        } else {
            alert('Error saving product');
        }
    } catch (err) {
        console.error(err);
    }
});

function editProduct(id, name, quantity, price, mfg, exp) {
    document.getElementById('productId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('quantity').value = quantity;
    document.getElementById('unitPrice').value = price;
    document.getElementById('mfgDate').value = mfg ? mfg.split('T')[0] : '';
    document.getElementById('expDate').value = exp ? exp.split('T')[0] : '';

    document.getElementById('submitBtn').textContent = 'Update Product';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('cancelBtn').style.display = 'none';
}

async function deleteProduct(id) {
    if (!confirm('Are you sure?')) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_PRODUCTS}/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (res.ok) {
            loadProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (err) {
        console.error(err);
    }
}
