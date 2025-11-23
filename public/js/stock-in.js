const API_URL_STOCK = `${CONFIG.API_BASE_URL}/stock`;
const API_URL_PRODUCTS = `${CONFIG.API_BASE_URL}/products`;
const API_URL_SUPPLIERS = `${CONFIG.API_BASE_URL}/suppliers`;

async function loadDropdowns() {
    const token = localStorage.getItem('token');
    try {
        // Load Products
        const prodRes = await fetch(API_URL_PRODUCTS, { headers: { 'x-auth-token': token } });
        const products = await prodRes.json();
        const prodSelect = document.getElementById('productSelect');
        products.forEach(p => {
            const option = document.createElement('option');
            option.value = p._id;
            option.textContent = p.name;
            prodSelect.appendChild(option);
        });

        // Load Suppliers
        const supRes = await fetch(API_URL_SUPPLIERS, { headers: { 'x-auth-token': token } });
        const suppliers = await supRes.json();
        const supSelect = document.getElementById('supplierSelect');
        suppliers.forEach(s => {
            const option = document.createElement('option');
            option.value = s._id;
            option.textContent = `${s.firstName} ${s.lastName}`;
            supSelect.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadRecentStockIn() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_STOCK}/in`, {
            headers: { 'x-auth-token': token }
        });
        const stockIn = await res.json();

        const tbody = document.getElementById('recentStockInTable');
        tbody.innerHTML = '';

        stockIn.forEach(entry => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.product ? entry.product.name : '-'}</td>
                <td>${entry.quantity}</td>
                <td>${entry.supplier ? entry.supplier.firstName : '-'}</td>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('stockInForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const product = document.getElementById('productSelect').value;
    const supplier = document.getElementById('supplierSelect').value;
    const quantity = document.getElementById('quantity').value;
    const unitPrice = document.getElementById('unitPrice').value;

    try {
        const res = await fetch(`${API_URL_STOCK}/in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ product, supplier, quantity, unitPrice })
        });

        if (res.ok) {
            document.getElementById('stockInForm').reset();
            loadRecentStockIn();
            alert('Stock added successfully');
        } else {
            alert('Error adding stock');
        }
    } catch (err) {
        console.error(err);
    }
});
