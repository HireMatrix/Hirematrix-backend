import nodemailer from 'nodemailer'
import dotenv from 'dotenv';

dotenv.config();

const hostToken = process.env.HOST_TOKEN;
const nodemailerPort = process.env.NODEMAILER_PORT;
const nodemailerUser = process.env.NODEMAILER_USER;
const nodemailerPass = process.env.NODEMAILER_PASS;

export const transport = nodemailer.createTransport({
  host: hostToken,
  port: nodemailerPort,
  secure: false,
  auth: {
    user: nodemailerUser,
    pass: nodemailerPass,
  },
});

export const sender = '"HireMatrix" <hirematrix.in@gmail.com>'