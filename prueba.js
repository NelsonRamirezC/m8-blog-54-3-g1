import bcrypt from 'bcrypt';

const generarHash = (password) => {

    const saltRounds = 12;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
}
