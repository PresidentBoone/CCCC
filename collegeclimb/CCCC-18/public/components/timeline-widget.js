<!-- timeline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Timeline - College Climb</title>
    <link rel="stylesheet" href="styles/timeline.css">
    <script src="https://cdn.jsdelivr.net/npm/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js"></script>
</head>
<body>
    <div class="timeline-container">
        <div id="timeline"></div>
    </div>

    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js';
        import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';

        const firebaseConfig = { /* Your Firebase Config */ };
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        async function loadTimeline() {
            const userId = /* Get current user ID */;
            const timelineRef = collection(db, 'users', userId, 'timeline');
            const snapshot = await getDocs(timelineRef);
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const container = document.getElementById('timeline');
            const itemsData = new vis.DataSet(items.map(item => ({
                start: item.date,
                content: item.eventType,
                title: item.details,
                type: 'box'
            })));

            const options = {
                editable: false,
                onMove: function (item, callback) {
                    // Handle item move
                }
            };

            new vis.Timeline(container, itemsData, options);
        }

        loadTimeline();
    </script>
</body>
</html>