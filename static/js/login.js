document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassword.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      togglePassword.querySelector('.password-icon').textContent = isPassword ? '🙈' : '👁';
    });
  }
});
