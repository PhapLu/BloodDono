// Show/Hide Password Input
const togglePasswordBtn = document.getElementById('togglePassword');
const PasswordInput = document.getElementById('password');

togglePasswordBtn.onclick = () => {
    const icon = togglePasswordBtn.querySelector('i');
    if (PasswordInput.type === 'password') {
        PasswordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        PasswordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};
