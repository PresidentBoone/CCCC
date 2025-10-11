<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - College Climb</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="timeline.css">
</head>
<body data-theme="dark">
    <nav class="cc-navbar">
        <!-- Navigation items -->
    </nav>

    <div class="dashboard-container">
        <h1>Welcome, <span id="userName"></span></h1>
        <div id="applicationTimeline" class="timeline"></div>
        <div id="notifications" class="notifications"></div>
    </div>

    <script type="module" src="firebase.js"></script>
    <script type="module" src="timeline.js"></script>
</body>
</html>