const bcrypt = require('bcrypt');

const sal1 = bcrypt.genSaltSync();
const salt2 = bcrypt.genSaltSync();

console.log(salt2, salt2);

const hash1 = bcrypt.hashSync('1', sal1);
const hash2 = bcrypt.hashSync('1', salt2);

console.log(bcrypt.compareSync('1', hash1));
console.log(bcrypt.compareSync('1', hash2));
