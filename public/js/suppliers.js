const API_URL_SUPPLIERS = `${CONFIG.API_BASE_URL}/suppliers`;
const API_URL_PRODUCTS = `${CONFIG.API_BASE_URL}/products`;
const API_URL_COMPANIES = `${CONFIG.API_BASE_URL}/companies`;

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

        // Load Companies
        const compRes = await fetch(API_URL_COMPANIES, { headers: { 'x-auth-token': token } });
        const companies = await compRes.json();
        const compSelect = document.getElementById('companySelect');
        companies.forEach(c => {
            const option = document.createElement('option');
            option.value = c._id;
            option.textContent = c.name;
            compSelect.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadSuppliers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL_SUPPLIERS, {
            headers: { 'x-auth-token': token }
        });
        const suppliers = await res.json();

        const tbody = document.getElementById('suppliersTableBody');
        tbody.innerHTML = '';

        suppliers.forEach(supplier => {
            const productNames = supplier.products ? supplier.products.map(p => p.name).join(', ') : '-';
            const productIds = supplier.products ? JSON.stringify(supplier.products.map(p => p._id)) : '[]';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${supplier.firstName} ${supplier.lastName}</td>
                <td>${supplier.address || ''}</td>
                <td>${supplier.company ? supplier.company.name : '-'}</td>
                <td>${productNames}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick='editSupplier("${supplier._id}", "${supplier.firstName}", "${supplier.lastName}", "${supplier.address || ''}", "${supplier.supplyDate || ''}", "${supplier.agreementDate || ''}", "${supplier.terminationDate || ''}", ${productIds}, "${supplier.company ? supplier.company._id : ''}")'>Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier._id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('supplierId').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const supplyDate = document.getElementById('supplyDate').value;
    const agreementDate = document.getElementById('agreementDate').value;
    const terminationDate = document.getElementById('terminationDate').value;

    // Get multiple selected products
    const productSelect = document.getElementById('productSelect');
    const products = Array.from(productSelect.selectedOptions).map(option => option.value).filter(val => val !== "");

    const company = document.getElementById('companySelect').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL_SUPPLIERS}/${id}` : API_URL_SUPPLIERS;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ firstName, lastName, address, supplyDate, agreementDate, terminationDate, products, company })
        });

        if (res.ok) {
            resetForm();
            loadSuppliers();
        } else {
            alert('Error saving supplier');
        }
    } catch (err) {
        console.error(err);
    }
});

function editSupplier(id, fname, lname, addr, sDate, aDate, tDate, prodIds, compId) {
    document.getElementById('supplierId').value = id;
    document.getElementById('firstName').value = fname;
    document.getElementById('lastName').value = lname;
    document.getElementById('address').value = addr;
    document.getElementById('supplyDate').value = sDate ? sDate.split('T')[0] : '';
    document.getElementById('agreementDate').value = aDate ? aDate.split('T')[0] : '';
    document.getElementById('terminationDate').value = tDate ? tDate.split('T')[0] : '';

    // Set multiple selected products
    const productSelect = document.getElementById('productSelect');
    Array.from(productSelect.options).forEach(option => {
        option.selected = prodIds.includes(option.value);
    });

    document.getElementById('companySelect').value = compId;

    document.getElementById('submitBtn').textContent = 'Update Supplier';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetForm() {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    document.getElementById('submitBtn').textContent = 'Add Supplier';
    document.getElementById('cancelBtn').style.display = 'none';
}

async function deleteSupplier(id) {
    if (!confirm('Are you sure?')) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_SUPPLIERS}/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (res.ok) {
            loadSuppliers();
        } else {
            alert('Error deleting supplier');
        }
    } catch (err) {
        console.error(err);
    }
}
