import mongoose from "mongoose";
import dotenv from 'dotenv';

import { sessionSaveSchema } from './types/db-schemas/sessionSave';
import { universityOptionSchema } from "./types/interfaces/universityOption";

/**
 * Doing Database initialization at one central place here
 */

dotenv.config();

// thx https://dev.to/danawoodman/storing-environment-variables-in-sveltekit-2of3 for env var tip especially vite_ public envs
// This will lead to an instant failure as soon as this file is imported in any client side component -> so e.g. client side page
export const MongoosePromise = mongoose.connect(process.env.MONGO_CONNECT_STRING);

// thx https://stackoverflow.com/a/70289007 for naming help
export const SessionSave = mongoose.model('session_save', sessionSaveSchema, 'sessionSaves');
export const UniversityOption = mongoose.model('universities', universityOptionSchema, 'universities');