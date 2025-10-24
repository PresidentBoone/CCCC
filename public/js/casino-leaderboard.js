/**
 * 🏆 CASINO LEADERBOARD SYSTEM - Social Competition
 *
 * Firebase-powered live leaderboard with real-time updates
 * Drives competitive engagement and FOMO
 *
 * @author Claude Code
 * @version 1.0.0
 */

class CasinoLeaderboard {
    constructor(firebaseDb, userId, userName) {
        this.db = firebaseDb;
        this.userId = userId;
        this.userName = userName;
        this.leaderboardRef = this.db.collection('leaderboards');
        this.userStatsRef = this.db.collection('users').doc(userId).collection('stats');
        this.listeners = [];
    }

    /**
     * Update user's score on the leaderboard
     */
    async updateScore(points, category = 'weekly') {
        try {
            const timestamp = new Date().toISOString();
            const weekNumber = this.getWeekNumber();

            const scoreData = {
                userId: this.userId,
                userName: this.userName,
                score: points,
                timestamp: timestamp,
                week: category === 'weekly' ? weekNumber : null
            };

            // Update weekly leaderboard
            if (category === 'weekly') {
                await this.leaderboardRef.doc('weekly').collection(weekNumber.toString())
                    .doc(this.userId).set(scoreData, { merge: true });
            }

            // Update all-time leaderboard
            if (category === 'allTime') {
                await this.leaderboardRef.doc('allTime').collection('scores')
                    .doc(this.userId).set(scoreData, { merge: true });
            }

            return true;
        } catch (error) {
            console.error('Failed to update leaderboard:', error);
            return false;
        }
    }

    /**
     * Get top players from leaderboard
     */
    async getTopPlayers(limit = 10, category = 'weekly') {
        try {
            const weekNumber = this.getWeekNumber();
            let collection;

            if (category === 'weekly') {
                collection = this.leaderboardRef.doc('weekly').collection(weekNumber.toString());
            } else {
                collection = this.leaderboardRef.doc('allTime').collection('scores');
            }

            const snapshot = await collection
                .orderBy('score', 'desc')
                .limit(limit)
                .get();

            const players = [];
            snapshot.forEach((doc, index) => {
                players.push({
                    rank: index + 1,
                    ...doc.data()
                });
            });

            return players;
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            return [];
        }
    }

    /**
     * Get user's current rank
     */
    async getUserRank(category = 'weekly') {
        try {
            const weekNumber = this.getWeekNumber();
            let collection;

            if (category === 'weekly') {
                collection = this.leaderboardRef.doc('weekly').collection(weekNumber.toString());
            } else {
                collection = this.leaderboardRef.doc('allTime').collection('scores');
            }

            // Get user's score
            const userDoc = await collection.doc(this.userId).get();
            if (!userDoc.exists) return null;

            const userScore = userDoc.data().score;

            // Count how many users have higher scores
            const higherScores = await collection
                .where('score', '>', userScore)
                .get();

            const rank = higherScores.size + 1;

            return {
                rank,
                score: userScore,
                totalPlayers: (await collection.get()).size
            };
        } catch (error) {
            console.error('Failed to get user rank:', error);
            return null;
        }
    }

    /**
     * Show leaderboard modal
     */
    async showLeaderboard() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'leaderboard-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: overlay-fade-in 0.3s ease-out;
        `;

        // Fetch data
        const weeklyTop = await this.getTopPlayers(10, 'weekly');
        const allTimeTop = await this.getTopPlayers(10, 'allTime');
        const userRank = await this.getUserRank('weekly');

        modal.innerHTML = this.getLeaderboardHTML(weeklyTop, allTimeTop, userRank);

        document.body.appendChild(modal);

        // Add close handler
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-btn')) {
                modal.style.animation = 'overlay-fade-out 0.3s ease-out';
                setTimeout(() => modal.remove(), 300);
            }
        });

        // Tab switching
        const weeklyTab = modal.querySelector('#weeklyTab');
        const allTimeTab = modal.querySelector('#allTimeTab');
        const weeklyContent = modal.querySelector('#weeklyContent');
        const allTimeContent = modal.querySelector('#allTimeContent');

        weeklyTab?.addEventListener('click', () => {
            weeklyTab.classList.add('active');
            allTimeTab.classList.remove('active');
            weeklyContent.style.display = 'block';
            allTimeContent.style.display = 'none';
        });

        allTimeTab?.addEventListener('click', () => {
            allTimeTab.classList.add('active');
            weeklyTab.classList.remove('active');
            allTimeContent.style.display = 'block';
            weeklyContent.style.display = 'none';
        });
    }

    getLeaderboardHTML(weeklyTop, allTimeTop, userRank) {
        return `
            <div style="
                background: var(--primary-bg);
                border-radius: 24px;
                padding: 2rem;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <!-- Header -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                ">
                    <h2 style="
                        font-size: 2.5rem;
                        font-weight: 900;
                        background: var(--gradient);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    ">
                        🏆 LEADERBOARD
                    </h2>
                    <button class="close-btn" style="
                        background: none;
                        border: none;
                        font-size: 2rem;
                        cursor: pointer;
                        color: var(--text-secondary);
                    ">×</button>
                </div>

                <!-- User's Current Rank -->
                ${userRank ? `
                <div style="
                    background: var(--gradient);
                    padding: 1.5rem;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                    text-align: center;
                    color: white;
                ">
                    <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 0.5rem;">
                        Your Rank
                    </div>
                    <div style="font-size: 3rem; font-weight: 900;">
                        #${userRank.rank}
                    </div>
                    <div style="font-size: 1.2rem; opacity: 0.9;">
                        ${userRank.score} points • Top ${Math.round((userRank.rank / userRank.totalPlayers) * 100)}%
                    </div>
                </div>
                ` : ''}

                <!-- Tabs -->
                <div style="
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid var(--secondary-bg);
                ">
                    <button id="weeklyTab" class="active" style="
                        padding: 1rem 2rem;
                        background: none;
                        border: none;
                        border-bottom: 3px solid var(--accent-color);
                        font-size: 1.2rem;
                        font-weight: 700;
                        color: var(--accent-color);
                        cursor: pointer;
                    ">
                        📅 This Week
                    </button>
                    <button id="allTimeTab" style="
                        padding: 1rem 2rem;
                        background: none;
                        border: none;
                        border-bottom: 3px solid transparent;
                        font-size: 1.2rem;
                        font-weight: 700;
                        color: var(--text-secondary);
                        cursor: pointer;
                    ">
                        👑 All Time
                    </button>
                </div>

                <!-- Weekly Leaderboard -->
                <div id="weeklyContent">
                    ${this.renderPlayerList(weeklyTop)}
                </div>

                <!-- All-Time Leaderboard -->
                <div id="allTimeContent" style="display: none;">
                    ${this.renderPlayerList(allTimeTop)}
                </div>

                <!-- Footer -->
                <div style="
                    margin-top: 2rem;
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                ">
                    Leaderboards reset every Sunday at midnight
                </div>
            </div>
        `;
    }

    renderPlayerList(players) {
        if (players.length === 0) {
            return `
                <div style="
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-secondary);
                ">
                    No players yet. Be the first!
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${players.map((player, index) => this.renderPlayerCard(player, index)).join('')}
            </div>
        `;
    }

    renderPlayerCard(player, index) {
        const rankEmojis = ['🥇', '🥈', '🥉'];
        const rankEmoji = rankEmojis[index] || '🏅';

        const isCurrentUser = player.userId === this.userId;

        return `
            <div style="
                background: ${isCurrentUser ? 'var(--gradient)' : 'var(--secondary-bg)'};
                padding: 1rem 1.5rem;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 1rem;
                ${isCurrentUser ? 'border: 2px solid var(--accent-color);' : ''}
                ${isCurrentUser ? 'color: white;' : ''}
                transition: all 0.3s ease;
            ">
                <!-- Rank -->
                <div style="
                    font-size: 2rem;
                    min-width: 50px;
                    text-align: center;
                ">
                    ${rankEmoji}
                </div>

                <!-- Player Info -->
                <div style="flex: 1;">
                    <div style="
                        font-size: 1.1rem;
                        font-weight: 700;
                        ${isCurrentUser ? 'color: white;' : 'color: var(--text-primary);'}
                    ">
                        ${player.userName} ${isCurrentUser ? '(You)' : ''}
                    </div>
                    <div style="
                        font-size: 0.9rem;
                        ${isCurrentUser ? 'opacity: 0.9;' : 'color: var(--text-secondary);'}
                    ">
                        Rank #${player.rank}
                    </div>
                </div>

                <!-- Score -->
                <div style="
                    font-size: 1.5rem;
                    font-weight: 900;
                    ${isCurrentUser ? 'color: white;' : 'color: var(--accent-color);'}
                ">
                    ${player.score.toLocaleString()}
                </div>
            </div>
        `;
    }

    /**
     * Get current ISO week number
     */
    getWeekNumber() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    }

    /**
     * Subscribe to real-time leaderboard updates
     */
    subscribeToUpdates(callback, category = 'weekly') {
        const weekNumber = this.getWeekNumber();
        let collection;

        if (category === 'weekly') {
            collection = this.leaderboardRef.doc('weekly').collection(weekNumber.toString());
        } else {
            collection = this.leaderboardRef.doc('allTime').collection('scores');
        }

        const unsubscribe = collection
            .orderBy('score', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                const players = [];
                snapshot.forEach((doc, index) => {
                    players.push({
                        rank: index + 1,
                        ...doc.data()
                    });
                });
                callback(players);
            });

        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Clean up listeners
     */
    destroy() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners = [];
    }
}

// ============================================
// EXPORT TO WINDOW
// ============================================

if (typeof window !== 'undefined') {
    window.CasinoLeaderboard = CasinoLeaderboard;
}
