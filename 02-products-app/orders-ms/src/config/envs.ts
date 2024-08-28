import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
})
    .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
    throw new Error(`Error al configurar el .env ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
    port: parseInt(process.env.PORT),
}