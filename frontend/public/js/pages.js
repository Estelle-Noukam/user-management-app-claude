async function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div class="page auth-page">
    <div class="auth-left">
      <div class="auth-grid"></div>
      <div class="auth-brand">User<span>Vault</span></div>
      <p class="auth-tagline">Gestion sécurisée des utilisateurs — RBAC, sessions, validation.</p>
    </div>
    <div class="auth-right">
      <h2>Connexion</h2>
      <p class="subtitle">Accédez à votre espace</p>
      <div class="error-banner" id="login-error"></div>
      <div class="form-group"><label>E-mail</label><input type="email" id="login-email" placeholder="vous@exemple.fr" /></div>
      <div class="form-group"><label>Mot de passe</label><input type="password" id="login-password" placeholder="••••••••" /></div>
      <button class="btn btn-primary btn-full mt-2" onclick="submitLogin()">Se connecter</button>
      <hr class="divider">
      <p class="text-center text-muted" style="font-size:0.85rem">Pas de compte ? <a href="#" onclick="Router.go('register')">S'inscrire</a></p>
      <p class="text-center" style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;font-family:var(--font-mono)">admin@example.com / Admin1234!</p>
    </div>
  </div>`;
  document.getElementById('login-password').addEventListener('keydown', e => { if(e.key==='Enter') submitLogin(); });
}

async function submitLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await Auth.login(email, password);
    Router.go('dashboard');
    toast('Bienvenue ' + Auth.current.username + ' !', 'success');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur de connexion'}], 'login-error');
  }
}

async function renderRegister() {
  document.getElementById('app').innerHTML = `
  <div class="page auth-page">
    <div class="auth-left">
      <div class="auth-grid"></div>
      <div class="auth-brand">User<span>Vault</span></div>
      <p class="auth-tagline">Créez votre compte en quelques secondes.</p>
    </div>
    <div class="auth-right">
      <h2>Inscription</h2>
      <p class="subtitle">Rejoignez la plateforme</p>
      <div class="error-banner" id="register-error"></div>
      <div class="form-row">
        <div class="form-group"><label>Prénom</label><input type="text" id="r-first_name" placeholder="Marie" /></div>
        <div class="form-group"><label>Nom</label><input type="text" id="r-last_name" placeholder="Dupont" /></div>
      </div>
      <div class="form-group"><label>Nom d'utilisateur *</label><input type="text" id="r-username" placeholder="marie_dupont" /></div>
      <div class="form-group"><label>E-mail *</label><input type="email" id="r-email" placeholder="vous@exemple.fr" /></div>
      <div class="form-group"><label>Mot de passe *</label><input type="password" id="r-password" placeholder="Min. 8 car., 1 maj., 1 chiffre" /></div>
      <div class="form-group"><label>Confirmation *</label><input type="password" id="r-confirm" placeholder="Répéter" /></div>
      <button class="btn btn-primary btn-full mt-2" onclick="submitRegister()">Créer mon compte</button>
      <hr class="divider">
      <p class="text-center text-muted" style="font-size:0.85rem">Déjà inscrit ? <a href="#" onclick="Router.go('login')">Se connecter</a></p>
    </div>
  </div>`;
}

async function submitRegister() {
  const payload = {
    first_name: document.getElementById('r-first_name').value.trim(),
    last_name: document.getElementById('r-last_name').value.trim(),
    username: document.getElementById('r-username').value.trim(),
    email: document.getElementById('r-email').value.trim(),
    password: document.getElementById('r-password').value,
    confirm_password: document.getElementById('r-confirm').value,
  };
  try {
    await Auth.register(payload);
    Router.go('dashboard');
    toast('Compte créé !', 'success');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||"Erreur d'inscription"}], 'register-error');
  }
}

async function renderDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  let allUsers = [];
  try {
    if (Auth.isAdmin()) allUsers = await api.get('/api/users');
    else allUsers = [await api.get(`/api/users/${Auth.current.id}`)];
  } catch {}
  const admins = allUsers.filter(u=>u.role==='admin').length;
  const users = allUsers.filter(u=>u.role==='user').length;
  app.innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="dashboard">
      <div class="page-header"><div><h2>Dashboard</h2><div class="sub">Bienvenue, ${esc(Auth.current.username)}</div></div></div>
      ${Auth.isAdmin()?`
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${allUsers.length}</div><div class="stat-label">Utilisateurs total</div></div>
        <div class="stat-card orange"><div class="stat-value">${admins}</div><div class="stat-label">Administrateurs</div></div>
        <div class="stat-card green"><div class="stat-value">${users}</div><div class="stat-label">Utilisateurs</div></div>
      </div>`:''}
      <div class="card">
        <div class="card-header">Mon compte</div>
        <div class="card-body">
          <div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap">
            <div class="avatar-lg">${avatarInitials(Auth.current)}</div>
            <div>
              <h3>${esc(((Auth.current.first_name||'')+' '+(Auth.current.last_name||'')).trim()||Auth.current.username)}</h3>
              <div style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.82rem">@${esc(Auth.current.username)} · ${Auth.current.role}</div>
            </div>
            <div style="margin-left:auto"><button class="btn btn-secondary btn-sm" onclick="Router.go('profile')">Éditer le profil →</button></div>
          </div>
        </div>
      </div>
      ${Auth.isAdmin()?`
      <div class="card">
        <div class="card-body" style="display:flex;gap:1rem;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="Router.go('admin')">Gérer les utilisateurs</button>
          <button class="btn btn-secondary" onclick="openCreateModal()">+ Ajouter un utilisateur</button>
        </div>
      </div>`:''}
    </div>
  </div>`;
}

let _allUsers = [];

async function renderAdmin() {
  if (!Auth.isAdmin()) { Router.go('dashboard'); return; }
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  try { _allUsers = await api.get('/api/users'); }
  catch { toast('Erreur chargement', 'error'); _allUsers = []; }
  renderAdminTable();
}

function renderAdminTable(filter='') {
  const users = filter
    ? _allUsers.filter(u=>(u.username+u.email+(u.first_name||'')+(u.last_name||'')).toLowerCase().includes(filter))
    : _allUsers;
  document.getElementById('app').innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="dashboard">
      <div class="page-header">
        <div><h2>Utilisateurs</h2><div class="sub">${_allUsers.length} compte(s)</div></div>
        <button class="btn btn-primary" onclick="openCreateModal()">+ Ajouter</button>
      </div>
      <div class="table-card">
        <div class="table-header">
          <div class="table-title">Tous les comptes</div>
          <input class="search-input" type="search" placeholder="Rechercher…" oninput="renderAdminTable(this.value.toLowerCase())" value="${esc(filter)}" />
        </div>
        ${users.length===0?`<div class="empty-state"><div class="icon">👤</div><h3>Aucun résultat</h3></div>`:`
        <table>
          <thead><tr><th>Utilisateur</th><th>E-mail</th><th>Rôle</th><th>Inscription</th><th>Actions</th></tr></thead>
          <tbody>
            ${users.map(u=>`
            <tr>
              <td><div class="avatar-cell">
                <div class="avatar ${u.role==='admin'?'admin':''}">${avatarInitials(u)}</div>
                <div><div style="font-weight:600">${esc(u.username)}</div>
                <div style="font-size:0.78rem;color:var(--text-muted)">${esc(((u.first_name||'')+' '+(u.last_name||'')).trim())}</div></div>
              </div></td>
              <td class="td-mono">${esc(u.email)}</td>
              <td><span class="badge badge-${u.role}">${u.role}</span></td>
              <td class="td-mono">${fmtDate(u.created_at)}</td>
              <td><div class="actions-cell">
                <button class="btn btn-ghost btn-sm" onclick="openEditModal(${u.id})">Éditer</button>
                ${u.id!==Auth.current.id?`<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id},'${esc(u.username)}')">Suppr.</button>`:''}
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>`}
      </div>
    </div>
  </div>`;
}

function openCreateModal() {
  openModal(renderModal({
    title: 'Créer un utilisateur',
    body: userFormFields({}, true, true),
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="submitCreate()">Créer</button>`,
  }));
}

async function submitCreate() {
  const payload = { username:getField('f-username'), email:getField('f-email'), role:getField('f-role'), first_name:getField('f-first_name'), last_name:getField('f-last_name'), bio:getField('f-bio'), password:getField('f-password'), confirm_password:getField('f-confirm_password') };
  try {
    const user = await api.post('/api/users', payload);
    _allUsers.push(user);
    closeModal();
    renderAdminTable();
    toast('Utilisateur créé', 'success');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'modal-error');
  }
}

function openEditModal(id) {
  const user = _allUsers.find(u=>u.id===id);
  if (!user) return;
  openModal(renderModal({
    title: "Modifier l'utilisateur",
    body: userFormFields(user, false, true),
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Annuler</button><button class="btn btn-primary" onclick="submitEdit(${id})">Enregistrer</button>`,
  }));
}

async function submitEdit(id) {
  const payload = { username:getField('f-username'), email:getField('f-email'), role:getField('f-role'), first_name:getField('f-first_name'), last_name:getField('f-last_name'), bio:getField('f-bio') };
  try {
    const updated = await api.put(`/api/users/${id}`, payload);
    const idx = _allUsers.findIndex(u=>u.id===id);
    if (idx!==-1) _allUsers[idx] = updated;
    closeModal();
    renderAdminTable();
    toast('Utilisateur mis à jour', 'success');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'modal-error');
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Supprimer "${username}" ?`)) return;
  try {
    await api.delete(`/api/users/${id}`);
    _allUsers = _allUsers.filter(u=>u.id!==id);
    renderAdminTable();
    toast('Utilisateur supprimé', 'info');
  } catch(err) {
    toast(err.data?.error||'Erreur', 'error');
  }
}

async function renderProfile() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="page"><div class="loading-page"><div class="spinner"></div></div></div>`;
  let user;
  try { user = await api.get(`/api/users/${Auth.current.id}`); }
  catch { toast('Erreur chargement profil', 'error'); Router.go('dashboard'); return; }
  app.innerHTML = `
  <div class="page">
    ${renderNavbar()}
    <div class="profile-page">
      <div class="profile-header">
        <div class="avatar-lg">${avatarInitials(user)}</div>
        <div class="profile-info">
          <h3>${esc(((user.first_name||'')+' '+(user.last_name||'')).trim()||user.username)}</h3>
          <div class="meta">@${esc(user.username)} · <span class="badge badge-${user.role}">${user.role}</span></div>
          <div class="meta" style="margin-top:6px">Membre depuis ${fmtDate(user.created_at)}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Informations personnelles</div>
        <div class="card-body">
          <div class="error-banner" id="profile-errors"></div>
          <div class="form-row">
            <div class="form-group"><label>Prénom</label><input type="text" id="p-first_name" value="${esc(user.first_name||'')}" /></div>
            <div class="form-group"><label>Nom</label><input type="text" id="p-last_name" value="${esc(user.last_name||'')}" /></div>
          </div>
          <div class="form-group"><label>E-mail</label><input type="email" id="p-email" value="${esc(user.email)}" /></div>
          <div class="form-group"><label>Bio</label><textarea id="p-bio">${esc(user.bio||'')}</textarea></div>
          <div class="form-group"><label>Nom d'utilisateur</label><input value="${esc(user.username)}" disabled style="opacity:0.5" /></div>
          <button class="btn btn-primary" onclick="submitProfile(${user.id})">Enregistrer</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Changer le mot de passe</div>
        <div class="card-body">
          <div class="error-banner" id="pw-errors"></div>
          <div class="form-group"><label>Mot de passe actuel</label><input type="password" id="pw-current" /></div>
          <div class="form-group"><label>Nouveau mot de passe</label><input type="password" id="pw-new" placeholder="Min. 8 car., 1 maj., 1 chiffre" /></div>
          <div class="form-group"><label>Confirmation</label><input type="password" id="pw-confirm" /></div>
          <button class="btn btn-secondary" onclick="submitPassword(${user.id})">Modifier</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function submitProfile(id) {
  const payload = { first_name:document.getElementById('p-first_name').value.trim(), last_name:document.getElementById('p-last_name').value.trim(), email:document.getElementById('p-email').value.trim(), bio:document.getElementById('p-bio').value.trim() };
  try {
    await api.put(`/api/users/${id}/profile`, payload);
    toast('Profil mis à jour', 'success');
    showErrors([], 'profile-errors');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'profile-errors');
  }
}

async function submitPassword(id) {
  const payload = { current_password:document.getElementById('pw-current').value, new_password:document.getElementById('pw-new').value, confirm_password:document.getElementById('pw-confirm').value };
  try {
    await api.put(`/api/users/${id}/password`, payload);
    toast('Mot de passe modifié', 'success');
    showErrors([], 'pw-errors');
    ['pw-current','pw-new','pw-confirm'].forEach(id=>document.getElementById(id).value='');
  } catch(err) {
    showErrors(err.data?.errors||[{msg:err.data?.error||'Erreur'}], 'pw-errors');
  }
}
