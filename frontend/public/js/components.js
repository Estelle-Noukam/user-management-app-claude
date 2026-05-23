function renderNavbar() {
  const u = Auth.current;
  if (!u) return '';
  return `
  <nav class="navbar">
    <div class="navbar-brand"><span class="dot"></span>UserVault</div>
    <div class="navbar-links">
      <button class="nav-link ${Router.current==='dashboard'?'active':''}" onclick="Router.go('dashboard')">Dashboard</button>
      <button class="nav-link ${Router.current==='profile'?'active':''}" onclick="Router.go('profile')">Profil</button>
      ${Auth.isAdmin()?`<button class="nav-link ${Router.current==='admin'?'active':''}" onclick="Router.go('admin')">Utilisateurs</button>`:''}
      <div class="navbar-user">
        <span class="badge badge-${u.role}">${u.role}</span>
        <span style="font-size:0.85rem;color:var(--text-dim);font-family:var(--font-mono)">${u.username}</span>
        <button class="nav-link danger" onclick="doLogout()">Déconnexion</button>
      </div>
    </div>
  </nav>`;
}

async function doLogout() {
  await Auth.logout();
  Router.go('login');
  toast('Déconnexion réussie', 'info');
}

function avatarInitials(user) {
  const fn = (user.first_name||'').trim();
  const ln = (user.last_name||'').trim();
  if (fn && ln) return (fn[0]+ln[0]).toUpperCase();
  return (user.username||'?').substring(0,2).toUpperCase();
}

function renderModal({title, body, footer}) {
  return `
  <div class="modal-overlay" id="modal-overlay" onclick="closeModalOutside(event)">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer?`<div class="modal-footer">${footer}</div>`:''}
    </div>
  </div>`;
}

function openModal(html) {
  closeModal();
  const el = document.createElement('div');
  el.id = 'modal-root';
  el.innerHTML = html;
  document.body.appendChild(el);
}

function closeModal() {
  const el = document.getElementById('modal-root');
  if (el) el.remove();
}

function closeModalOutside(e) {
  if (e.target.id === 'modal-overlay') closeModal();
}

function userFormFields(user={}, includePassword=false, includeRole=true) {
  return `
  <div class="error-banner" id="modal-error"></div>
  <div class="form-row">
    <div class="form-group"><label>Prénom</label><input type="text" id="f-first_name" value="${esc(user.first_name||'')}" /></div>
    <div class="form-group"><label>Nom</label><input type="text" id="f-last_name" value="${esc(user.last_name||'')}" /></div>
  </div>
  <div class="form-group"><label>Nom d'utilisateur *</label><input type="text" id="f-username" value="${esc(user.username||'')}" /></div>
  <div class="form-group"><label>E-mail *</label><input type="email" id="f-email" value="${esc(user.email||'')}" /></div>
  ${includeRole?`<div class="form-group"><label>Rôle</label><select id="f-role"><option value="user" ${user.role==='user'||!user.role?'selected':''}>Utilisateur</option><option value="admin" ${user.role==='admin'?'selected':''}>Admin</option></select></div>`:''}
  <div class="form-group"><label>Bio</label><textarea id="f-bio">${esc(user.bio||'')}</textarea></div>
  ${includePassword?`
  <hr class="divider">
  <div class="form-group"><label>Mot de passe *</label><input type="password" id="f-password" /></div>
  <div class="form-group"><label>Confirmation *</label><input type="password" id="f-confirm_password" /></div>`:''}`;
}

function getField(id) { return (document.getElementById(id)||{}).value||''; }

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
}
