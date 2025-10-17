Jednostavna e-learning aplikacija sa ulogama admin / teacher / student. Nastavnici kreiraju kurseve i otpremaju video lekcije i materijale; studenti se prijavljuju na kurseve, prate sadržaj i dobijaju sertifikate. Admin vidi osnovne vizualizacije (Google Charts).

Tehnologije

Backend: Laravel + Sanctum (Bearer token), MySQL/MariaDB

Frontend: React (Axios, React Router), Google Charts

Brzi start
1) Kloniranje
git clone <URL-REPOZITORIJUMA>
cd eLearn

2) Backend (Laravel)
cd backend
cp .env.example .env
composer install
php artisan key:generate
# Podesi .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD, FILESYSTEM_DISK=public)
php artisan migrate
php artisan storage:link
php artisan serve  # http://localhost:8000


(Opcionalno) Napravi korisnike u Tinker-u:

use App\Models\User;
User::create(['name'=>'Admin','email'=>'admin@example.com','password'=>bcrypt('password'),'role'=>'admin']);
User::create(['name'=>'Teacher','email'=>'teacher@example.com','password'=>bcrypt('password'),'role'=>'teacher']);
User::create(['name'=>'Student','email'=>'student@example.com','password'=>bcrypt('password'),'role'=>'student']);

3) Frontend (React)
cd ../frontend
npm install
# API baza je podešena na http://localhost:8000/api (vidi src/api/api-client.js)
npm run dev   # ili npm start, u zavisnosti od toolchaina


Frontend: http://localhost:5173 (Vite) ili http://localhost:3000 (CRA).
