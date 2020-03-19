

function generateRandomString(n) {
    let string = '',
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < n; i++) {
        string += chars.charAt(Math.floor(Math.random() * chars.length));
    }
   return string
}

module.exports = { 
    generateRandomString
}