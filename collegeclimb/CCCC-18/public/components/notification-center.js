// timeline.js
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js';

const db = getFirestore();

async function loadUserTimeline(userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        const timelineData = userDoc.data().applicationTimeline || [];
        renderTimeline(timelineData);
    }
}

function renderTimeline(timelineData) {
    const timelineContainer = document.getElementById('timelineContainer');
    timelineContainer.innerHTML = ''; // Clear existing content

    timelineData.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'timeline-event';
        eventElement.innerHTML = `
            <div class="timeline-date">${event.date}</div>
            <div class="timeline-description">${event.description}</div>
        `;
        timelineContainer.appendChild(eventElement);
    });
}

// Call this function when the user is authenticated
loadUserTimeline(currentUser.uid);