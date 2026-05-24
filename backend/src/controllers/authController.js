import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db/connection.js';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi')
});

/**
 * Handles user login request. Validates credentials and returns JWT token.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await db('users')
      .where({ username, is_active: 1 })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Username atau password salah!'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Username atau password salah!'
      });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_tokoquu_jwt_key_that_is_long_and_random',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: payload,
      message: 'Login berhasil!'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handles user logout. (Since JWT is stateless, we just return success)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function logout(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout berhasil!'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns current logged-in user profile.
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} Response JSON
 */
export async function me(req, res, next) {
  try {
    const user = await db('users')
      .where({ id: req.user.id, is_active: 1 })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan!'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (err) {
    next(err);
  }
}
