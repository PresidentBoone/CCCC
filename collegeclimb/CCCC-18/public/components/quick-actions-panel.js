<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Timeline - College Climb</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        /* Basic styles for the timeline */
        body {
            font-family: 'Inter', sans-serif;
            background: var(--primary-bg);
            color: var(--text-primary);
        }
        .timeline-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .timeline {
            position: relative;
            padding: 10px 0;
        }
        .timeline-event {
            position: relative;
            margin: 20px 0;
            padding: 10px;
            border-left: 2px solid var(--accent-color);
        }
        .timeline-event::before {
            content: '';
            position: absolute;
            left: -7px;
            top: 10px;
            width: 14px;
            height: 14px;
            background: var(--accent-color);
            border-radius: 50%;
        }
        .event-date {
            font-weight: bold;
        }
        .event-description {
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="timeline-container">
        <h1>Application Timeline</h1>
        <div class="timeline" id="timeline"></div>
    </div>

    <script type="module">
        import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';

        const db = getFirestore();

        async function loadTimeline() {
            const userId = 'currentUserId'; // Replace with actual user ID
            const timelineRef = collection(db, `users/${userId}/timeline`);
            const snapshot = await getDocs(timelineRef);
            const timelineContainer = document.getElementById('timeline');

            snapshot.forEach(doc => {
                const event = doc.data();
                const eventElement = document.createElement('div');
                eventElement.className = 'timeline-event';
                eventElement.innerHTML = `
                    <div class="event-date">${event.date}</div>
                    <div class="event-description">${event.description}</div>
                `;
                timelineContainer.appendChild(eventElement);
            });
        }

        loadTimeline();
    </script>
</body>
</html>