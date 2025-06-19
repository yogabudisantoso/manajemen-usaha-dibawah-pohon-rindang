const bcrypt = require('bcryptjs');

const password = 'password1234'; // Ganti dengan password yang diinginkan jika bukan 'password123'
const saltRounds = 10; // Jumlah salt rounds, sama dengan yang biasa digunakan aplikasi

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error generating hash:', err);
    } else {
        console.log('Password:', password);
        console.log('Hash:', hash);
    }
});