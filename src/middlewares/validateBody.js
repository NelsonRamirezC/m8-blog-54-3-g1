const validateBody = (req, res, next) => {
    if(!req.body){
        return res.status(400).json({status: "fail", message: "No se proporciona body / payload."});
    }

    next();
}

export default validateBody;