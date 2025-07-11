document.addEventListener('DOMContentLoaded', () => {
  // DASHBOARD PAGE DATA FETCH
  if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'index.html';
    } else {
      fetch('http://localhost:5000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        document.getElementById('users-count').textContent = data.userCount;
        document.getElementById('logs-count').textContent = data.logs;
        document.getElementById('errors-count').textContent = data.errors;
      })
      .catch(err => {
        console.error(err);
        alert('Unauthorized. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      });
    }
  }

  // LOGIN FORM HANDLER
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('Username')?.value || document.getElementById('username')?.value;
      const password = document.getElementById('Password')?.value || document.getElementById('password')?.value;
      const email = document.getElementById('Email')?.value || document.getElementById('email')?.value;

      if (!username || !email || !password) {
        alert('All fields are required.');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = 'dashboard.html';
        } else {
          alert(data.msg || 'Login failed');
        }
      } catch (err) {
        alert('Server error');
      }
    });
  }

  // LOGOUT HANDLER
  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }
});
