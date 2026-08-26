import bcrypt from 'bcrypt';

const generarHash = (password) => {

    const saltRounds = 12;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
}


let miHash = generarHash("123456");

let result = bcrypt.compareSync("123456", miHash);

console.log(result);
