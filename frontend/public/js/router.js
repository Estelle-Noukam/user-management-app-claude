const Router = {
  current: null,
  routes: { login:renderLogin, register:renderRegister, dashboard:renderDashboard, admin:renderAdmin, profile:renderProfile },
  async go(page) {
    Router.current = page;
    window.location.hash = page;
    await Router.render(page);
  },
  async render(page) {
    const fn = Router.routes[page];
    if (fn) await fn();
  },
  async init() {
    document.getElementById('app').innerHTML = `<div class="loading-page"><div class="spinner"></div></div>`;
    await Auth.load();
    const hash = window.location.hash.replace('#','');
    if (!Auth.current) Router.go(['login','register'].includes(hash)?hash:'login');
    else Router.go(['dashboard','admin','profile'].includes(hash)?hash:'dashboard');
  }
};

window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#','');
  Router.current = page;
  if (!Auth.current && !['login','register'].includes(page)) Router.go('login');
  else if (Auth.current && ['login','register'].includes(page)) Router.go('dashboard');
  else Router.render(page);
});

Router.init();
