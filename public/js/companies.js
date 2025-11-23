const API_URL_COMPANIES = `${CONFIG.API_BASE_URL}/companies`;

async function loadCompanies() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL_COMPANIES, {
            headers: { 'x-auth-token': token }
        });
        const companies = await res.json();

        const tbody = document.getElementById('companiesTableBody');
        tbody.innerHTML = '';

        companies.forEach(company => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${company.name}</td>
                <td>${company.telephone || ''}</td>
                <td>${company.location || ''}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editCompany('${company._id}', '${company.name}', '${company.telephone || ''}', '${company.location || ''}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCompany('${company._id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('companyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const id = document.getElementById('companyId').value;
    const name = document.getElementById('name').value;
    const telephone = document.getElementById('telephone').value;
    const location = document.getElementById('location').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL_COMPANIES}/${id}` : API_URL_COMPANIES;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ name, telephone, location })
        });

        if (res.ok) {
            resetForm();
            loadCompanies();
        } else {
            alert('Error saving company');
        }
    } catch (err) {
        console.error(err);
    }
});

function editCompany(id, name, telephone, location) {
    document.getElementById('companyId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('telephone').value = telephone;
    document.getElementById('location').value = location;

    document.getElementById('submitBtn').textContent = 'Update Company';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

function resetForm() {
    document.getElementById('companyForm').reset();
    document.getElementById('companyId').value = '';
    document.getElementById('submitBtn').textContent = 'Add Company';
    document.getElementById('cancelBtn').style.display = 'none';
}

async function deleteCompany(id) {
    if (!confirm('Are you sure?')) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL_COMPANIES}/${id}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        if (res.ok) {
            loadCompanies();
        } else {
            alert('Error deleting company');
        }
    } catch (err) {
        console.error(err);
    }
}
