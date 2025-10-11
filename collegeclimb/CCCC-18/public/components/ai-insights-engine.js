// Firestore structure example
const userTimelineRef = doc(db, 'users', userId);
const timelineData = {
    events: [
        {
            title: "College Research",
            date: "2023-09-01",
            description: "Started researching colleges.",
            status: "completed"
        },
        {
            title: "Application Deadline",
            date: "2023-11-01",
            description: "Application due for College A.",
            status: "upcoming"
        },
        // More events...
    ]
};
await setDoc(userTimelineRef, timelineData);