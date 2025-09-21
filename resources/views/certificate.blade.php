<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <title>Sertifikat o završenom kursu</title>
    <style>
        body { text-align: center; font-family: Arial, sans-serif; }
        .container { 
            padding: 50px; 
            border: 10px solid #2E86C1; 
            width: 80%; 
            margin: auto; 
            text-align: center;
        }
        h1 { color: #2E86C1; font-size: 40px; }
        p { font-size: 20px; margin: 15px 0; }
        .signature { margin-top: 50px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <h1>SERTIFIKAT</h1>
        <p>Ovim se potvrđuje da je <strong>{{ $name }}</strong></p>
        <p>uspešno završio kurs <strong>{{ $course }}</strong>.</p>
        <p>Datum izdavanja: <strong>{{ $date }}</strong></p>
        <p class="signature">E-Learning Platform</p>
    </div>
</body>
</html>
