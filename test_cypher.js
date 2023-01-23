const { encrypt, decrypt } = require('./utils');

const key = 'fsfsfas';
const message = 'fsafsafs2';
const x = decrypt(key, message);

console.log(x);
