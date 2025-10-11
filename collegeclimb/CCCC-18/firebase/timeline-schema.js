<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - College Climb</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="styles/dashboard.css"> <!-- New CSS file for dashboard styles -->
</head>
<body data-theme="dark">
    <nav class="cc-navbar">
        <a href="index.html" class="cc-logo-section"></a>
        <div class="cc-nav-right"></div>
    </nav>

    <div class="dashboard-container">
        <h1>Welcome, <span id="userName"></span></h1>
        <div class="timeline" id="applicationTimeline"></div>
        <div class="recommendations" id="aiRecommendations"></div>
        <div class="progress-tracker" id="progressTracker"></div>
    </div>

    <script type="module" src="scripts/dashboard.js"></script> <!-- New JS file for dashboard functionality -->
</body>
</html>