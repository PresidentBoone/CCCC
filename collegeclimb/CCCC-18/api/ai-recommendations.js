<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Timeline - College Climb</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="path/to/your/timeline.css">
    <script src="https://cdn.jsdelivr.net/npm/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js"></script>
    <style>
        /* Add your styles here */
    </style>
</head>
<body data-theme="dark">
    <nav class="cc-navbar">
        <!-- Navigation items -->
    </nav>

    <div class="timeline-container">
        <h1>Your Application Timeline</h1>
        <div id="timeline"></div>
        <button id="addEventBtn">Add Event</button>
    </div>

    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js';
        import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js';
        import { getFirestore, collection, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';

        const firebaseConfig = { /* Your Firebase config */ };
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        let currentUser = null;

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                loadTimelineEvents();
            }
        });

        async function loadTimelineEvents() {
            const eventsCollection = collection(db, `users/${currentUser.uid}/timelineEvents`);
            const eventsSnapshot = await getDocs(eventsCollection);
            const events = eventsSnapshot.docs.map(doc => doc.data());
            renderTimeline(events);
        }

        function renderTimeline(events) {
            const container = document.getElementById('timeline');
            const items = new vis.DataSet(events.map(event => ({
                id: event.id,
                content: event.title,
                start: event.date,
                type: 'box'
            })));
            const options = {};
            new vis.Timeline(container, items, options);
        }

        document.getElementById('addEventBtn').addEventListener('click', async () => {
            const newEvent = {
                title: prompt("Enter event title:"),
                date: prompt("Enter event date (YYYY-MM-DD):"),
                // Add other properties as needed
            };
            await addDoc(collection(db, `users/${currentUser.uid}/timelineEvents`), newEvent);
            loadTimelineEvents(); // Refresh the timeline
        });
    </script>
</body>
</html>