import axios from 'axios';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const url = 'https://sikda-optima.com/sikda-optima/dashboard';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionlogin = fs.readFileSync(path.join(__dirname, 'session.txt').toString());

const instance = axios.create({
  withCredentials: true,
  baseURL: 'https://sikda-optima.com'
});

const app = express();

app.get('/', function (_, res) {
  instance
    .get('/sikda-optima/dashboard', {
      headers: {
        'set-cookie': sessionlogin
      }
    })
    .then((response) => {
      res.send(response.data);
    });
});

http.createServer(app).listen(4000);
