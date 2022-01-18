import mongoose from "mongoose";
import { sessionSaveSchema } from './types/sessionSave';
import dotenv from 'dotenv';

/**
 * Doing Database initialization at one central place here
 */

dotenv.config();

// thx https://dev.to/danawoodman/storing-environment-variables-in-sveltekit-2of3 for env var tip especially vite_ public envs
// This will lead to an instant failure as soon as this file is imported in any client side component -> so e.g. client side page
mongoose.connect(process.env.MONGO_CONNECT_STRING)

export const SessionSave = mongoose.model('sessionSave', sessionSaveSchema);