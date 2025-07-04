// Cambiar entre login y registro
function toggleForm() {
  const regSection = document.getElementById('registerSection');
  regSection.style.display = regSection.style.display === 'block' ? 'none' : 'block';
}

// Registro de usuario
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(user => user.name.toLowerCase() === name.toLowerCase())) {
    alert('Ese nombre de usuario ya existe.');
    return;
  }

  users.push({ name, password, address, phone });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Usuario registrado correctamente.');

  document.getElementById('registerForm').reset();
  toggleForm();
});

// Login de usuario
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);

  if (user) {
    localStorage.setItem('activeUser', user.name);
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('menuApp').style.display = 'block';
    document.getElementById('userGreeting').textContent = `👋 Bienvenido, ${user.name}`;
    loadCalls();
  } else {
    alert('Nombre o contraseña incorrectos.');
  }
});

// Verificar sesión activa al cargar
window.addEventListener('load', function () {
  const activeUser = localStorage.getItem('activeUser');
  if (activeUser) {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('menuApp').style.display = 'block';
    document.getElementById('userGreeting').textContent = `👋 Bienvenido, ${activeUser}`;
    loadCalls();
  }
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('activeUser');
  document.getElementById('menuApp').style.display = 'none';
  document.getElementById('callApp').style.display = 'none';
  document.getElementById('reportsApp').style.display = 'none';
  document.getElementById('authContainer').style.display = 'block';
  document.getElementById('loginForm').reset();
  document.getElementById('registerSection').style.display = 'none';
});

// Menú principal
const btnCalls = document.getElementById('menuCalls');
const btnReports = document.getElementById('menuReports');
const callApp = document.getElementById('callApp');
const reportsApp = document.getElementById('reportsApp');

btnCalls.addEventListener('click', () => {
  btnCalls.classList.add('active');
  btnReports.classList.remove('active');
  reportsApp.style.display = 'none';
  callApp.style.display = 'block';
});

btnReports.addEventListener('click', () => {
  btnReports.classList.add('active');
  btnCalls.classList.remove('active');
  callApp.style.display = 'none';
  reportsApp.style.display = 'block';
  document.getElementById('filteredCallsList').innerHTML = '';
  document.getElementById('filterForm').reset();
});

// Guardar llamada
document.getElementById('callForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const date = document.getElementById('date').value;
  const notes = document.getElementById('notes').value.trim();

  const call = { name, date, notes };
  saveCall(call);
  renderCall(call, true);
  document.getElementById('callForm').reset();
});

function saveCall(call) {
  const calls = getCalls();
  calls.unshift(call);
  localStorage.setItem('calls', JSON.stringify(calls));
}

function getCalls() {
  return JSON.parse(localStorage.getItem('calls')) || [];
}

function renderCall(call, prepend = false) {
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>📞 ${call.name}</strong><br>
    📅 ${call.date}<br>
    📝 ${call.notes || 'Sin notas'}
  `;
  const list = document.getElementById('callList');
  prepend ? list.prepend(li) : list.appendChild(li);
}

function loadCalls() {
  const calls = getCalls();
  document.getElementById('callList').innerHTML = '';
  calls.forEach(call => renderCall(call));
}

document.getElementById('clearHistory').addEventListener('click', () => {
  if (confirm('¿Estás seguro de que deseas eliminar todo el historial de llamadas?')) {
    localStorage.removeItem('calls');
    document.getElementById('callList').innerHTML = '';
    alert('Historial eliminado.');
  }
});

document.getElementById('downloadTxt').addEventListener('click', function () {
  const calls = getCalls();
  if (calls.length === 0) {
    alert('No hay llamadas registradas.');
    return;
  }

  const text = calls.map(call =>
    `📞 ${call.name}\n📅 ${call.date}\n📝 ${call.notes || 'Sin notas'}\n`
  ).join('\n');

  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'registro_llamadas.txt';
  link.click();
});

document.getElementById('downloadExcel').addEventListener('click', function () {
  const calls = getCalls();
  if (!calls.length) {
    alert('No hay llamadas registradas.');
    return;
  }

  const formatted = calls.map(call => ({
    '📞 A quién se llamó': call.name,
    '📅 Fecha': call.date,
    '📝 Notas': call.notes || 'Sin notas'
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registro de Llamadas');
  XLSX.writeFile(wb, 'registro_llamadas.xlsx');
});

document.getElementById('filterForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const filterDate = document.getElementById('filterDate').value;
  if (!filterDate) return alert('Selecciona una fecha.');

  const calls = getCalls();
  const filtered = calls.filter(call => call.date === filterDate);

  const ul = document.getElementById('filteredCallsList');
  ul.innerHTML = '';

  if (filtered.length === 0) {
    ul.innerHTML = '<li>No se encontraron llamadas en esa fecha.</li>';
    return;
  }

  filtered.forEach(call => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>📞 ${call.name}</strong><br>
      📅 ${call.date}<br>
      📝 ${call.notes || 'Sin notas'}
    `;
    ul.appendChild(li);
  });
});

document.getElementById('clearFilter').addEventListener('click', () => {
  document.getElementById('filteredCallsList').innerHTML = '';
  document.getElementById('filterForm').reset();
});
