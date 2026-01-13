# Mailer Install Guide

## Requirements
- Ubuntu 22.04+
- Node 18+
- Nginx
- PM2

## Install
sudo apt install nodejs npm nginx
npm install -g pm2

## Backend
cd backend
npm install
cp .env.example .env
pm2 start server.js --name mailer-backend

## Frontend
cd ../frontend
npm install
npm run build

## Nginx
Point root to frontend/dist
Proxy /api to backend

## Start
pm2 save

