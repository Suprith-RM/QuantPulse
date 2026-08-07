const { sendValidationError } = require('../utils/apiResponse');

const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if(!result.success) {
        const errors = result.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
        return sendValidationError(res, errors);
    }
    
    req[source] = result.data; // Replace with validated data

    next();
}

module.exports = validate;