const API_URL_STOCK = `${CONFIG.API_BASE_URL}/stock`;
const API_URL_PRODUCTS = `${CONFIG.API_BASE_URL}/products`;
const API_URL_AUTH = `${CONFIG.API_BASE_URL}/auth`;

let cart = [];

async function loadCashierData() {
    const token = localStorage.getItem('token');

    // Load User Info
    try {
        const userRes = await fetch(`${API_URL_AUTH}/user`, { headers: { 'x-auth-token': token } });
        if (!userRes.ok) {
            if (userRes.status === 401) {
                alert('Session expired. Please login again.');
                logout();
                return;
            }
            throw new Error('Failed to load user');
        }
        const user = await userRes.json();
        document.getElementById('cashierName').textContent = user.username;
    } catch (err) {
        console.error(err);
    }

    // Load Products
    loadProducts();

    // Load My Sales
    loadMySales();
}

async function loadProducts() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL_PRODUCTS, { headers: { 'x-auth-token': token } });
        if (!res.ok) throw new Error('Failed to load products');
        const products = await res.json();
        const prodSelect = document.getElementById('productSelect');

        // Clear existing options except first
        prodSelect.innerHTML = '<option value="">Select Product</option>';

        products.forEach(p => {
            const option = document.createElement('option');
            option.value = p._id;
            option.textContent = `${p.name}`;
            option.dataset.qty = p.quantity;
            option.dataset.price = p.unitPrice;
            option.dataset.name = p.name;
            prodSelect.appendChild(option);
        });

        prodSelect.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.value) {
                document.getElementById('qtyAvailable').value = selectedOption.dataset.qty;
                document.getElementById('unitPrice').value = selectedOption.dataset.price;
            } else {
                document.getElementById('qtyAvailable').value = '';
                document.getElementById('unitPrice').value = '';
            }
        });

    } catch (err) {
        console.error(err);
    }
}

async function loadMySales() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_STOCK}/out/my-sales`, {
            headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Failed to load sales');
        const sales = await res.json();

        const tbody = document.getElementById('mySalesTable');
        tbody.innerHTML = '';

        sales.forEach(sale => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(sale.date).toLocaleDateString()} ${new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${sale.product ? sale.product.name : '-'}</td>
                <td>${sale.quantity}</td>
                <td>${(sale.sellingPrice * sale.quantity).toFixed(2)} RWF</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function addToCart() {
    const productSelect = document.getElementById('productSelect');
    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].dataset.name;
    const qtyAvailable = parseInt(document.getElementById('qtyAvailable').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);

    if (!productId || !quantity || !sellingPrice) {
        alert('Please fill in all fields');
        return;
    }

    if (quantity > qtyAvailable) {
        alert(`Only ${qtyAvailable} items available in stock!`);
        return;
    }

    cart.push({
        product: productId,
        name: productName,
        quantity,
        unitPrice,
        sellingPrice,
        total: quantity * sellingPrice
    });

    renderCart();

    // Reset inputs
    productSelect.value = '';
    document.getElementById('qtyAvailable').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('unitPrice').value = '';
    document.getElementById('sellingPrice').value = '';
}

function renderCart() {
    const tbody = document.getElementById('cartTableBody');
    tbody.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.total;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.sellingPrice.toFixed(2)}</td>
            <td>${item.total.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">X</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

async function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    const customerName = document.getElementById('customerName').value;
    if (!customerName) {
        alert('Please enter customer name');
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_STOCK}/out`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ cart, customerName })
        });

        const data = await res.json();

        if (res.ok) {
            cart = [];
            renderCart();
            document.getElementById('customerName').value = '';
            loadMySales(); // Refresh history
            loadProducts(); // Refresh stock levels

            if (confirm('Sale successful! Print Invoice?')) {
                printInvoice(data, customerName);
            }
        } else {
            alert(data.msg || 'Error selling stock');
        }
    } catch (err) {
        console.error(err);
        alert('Server Error');
    }
}

function printInvoice(items, customerName) {
    // Reuse the print logic from stock-out.js or duplicate it here for simplicity
    // For now, let's duplicate the core logic to keep this file self-contained
    let grandTotal = 0;
    const rows = items.map(item => {
        const total = item.sellingPrice * item.quantity;
        grandTotal += total;
        return `
            <tr>
                <td>${item.product.name}</td>
                <td>${item.quantity}</td>
                <td>${item.sellingPrice.toFixed(2)} RWF</td>
                <td>${total.toFixed(2)} RWF</td>
            </tr>
        `;
    }).join('');

    const date = new Date().toLocaleString();
    const invoiceId = items[0].invoiceId || 'N/A';

    const invoiceHtml = `
        <html>
        <head>
            <title>Invoice</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f8f9fa; }
                .total { text-align: right; font-size: 1.2em; font-weight: bold; }
                .footer { text-align: center; margin-top: 50px; font-size: 0.8em; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>INVOICE</h1>
                <h3>Stock Management System</h3>
            </div>
            <div class="invoice-details">
                <p><strong>Invoice Ref:</strong> ${invoiceId}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Customer:</strong> ${customerName}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <div class="total">
                Total Amount: ${grandTotal.toFixed(2)} RWF
            </div>
            <div class="footer">
                <p>Thank you for your business!</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
}
