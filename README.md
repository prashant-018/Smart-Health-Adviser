# Smart Health Adviser

## Project Structure

```
Smart-Health-Adviser/
├── backend/          ← Python / Flask API
│   ├── chatbot_web.py
│   ├── disease_model/
│   ├── medicine_dectector/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/         ← React UI
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
```

## Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python chatbot_web.py
```
Runs at: http://localhost:5000

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```
Runs at: http://localhost:3000

## Deploy on AWS
- Backend → EC2 (run with gunicorn)
- Frontend → S3 static hosting
- Set REACT_APP_API_BASE_URL in frontend/.env to your EC2 public IP
