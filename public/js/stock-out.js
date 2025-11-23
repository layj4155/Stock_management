const API_URL_STOCK = `${CONFIG.API_BASE_URL}/stock`;
const API_URL_PRODUCTS = `${CONFIG.API_BASE_URL}/products`;

let cart = [];

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
            option.textContent = `${p.name} (Qty: ${p.quantity})`;
            option.dataset.price = p.unitPrice;
            option.dataset.name = p.name;
            prodSelect.appendChild(option);
        });

        prodSelect.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.dataset.price) {
                document.getElementById('unitPrice').value = selectedOption.dataset.price;
            } else {
                document.getElementById('unitPrice').value = '';
            }
        });

    } catch (err) {
        console.error(err);
    }
}

async function loadRecentStockOut() {
    const token = localStorage.getItem('token');
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    let url = `${API_URL_STOCK}/out`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
        const res = await fetch(url, {
            headers: { 'x-auth-token': token }
        });
        const stockOut = await res.json();

        const tbody = document.getElementById('recentStockOutTable');
        tbody.innerHTML = '';

        stockOut.forEach(entry => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${entry.product ? entry.product.name : '-'}</td>
                <td>${entry.quantity}</td>
                <td>${entry.customerName || '-'}</td>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>
                    ${entry.invoiceId ? `<button class="btn btn-sm btn-secondary" onclick="printEntry('${entry.invoiceId}', '${entry.customerName || ''}')">Print Invoice</button>` : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function printEntry(invoiceId, customerName) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_STOCK}/out/invoice/${invoiceId}`, {
            headers: { 'x-auth-token': token }
        });
        const items = await res.json();

        if (items && items.length > 0) {
            printInvoice(items, customerName || 'Customer');
        } else {
            alert('No items found for this invoice.');
        }
    } catch (err) {
        console.error(err);
        alert('Error fetching invoice details');
    }
}

function addToCart() {
    const productSelect = document.getElementById('productSelect');
    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].dataset.name;
    const quantity = parseInt(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);

    if (!productId || !quantity || !sellingPrice) {
        alert('Please fill in all item fields');
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

    // Reset item fields
    document.getElementById('productSelect').value = '';
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
            <td>${item.sellingPrice.toFixed(2)} RWF</td>
            <td>${item.total.toFixed(2)} RWF</td>
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
    // console.log('Sending Cart:', cart); // Removed log
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
            loadRecentStockOut();

            if (confirm('Stock sold successfully. Do you want to print the invoice?')) {
                try {
                    printInvoice(data, customerName);
                } catch (printErr) {
                    console.error('Printing failed:', printErr);
                    alert('Could not open invoice. Please allow popups for this site.');
                }
            }
        } else {
            alert(data.msg || 'Error selling stock');
        }
    } catch (err) {
        console.error(err);
        alert('Server Error: ' + err.message);
    }
}

function printInvoice(items, customerName) {
    // items is the array of created StockOut records returned from API
    // We need to calculate grand total
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
    const invoiceId = items[0].invoiceId; // Use the generated Invoice ID

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
                @media print {
                    .no-print { display: none; }
                }
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

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups for this website to print the invoice.');
        return;
    }
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
}
