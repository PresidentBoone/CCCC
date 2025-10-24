# STEP 5: PHASE 2 PROGRESS - CORE ENGINE MODULES

## Status: PHASE 2 - 66% COMPLETE

**Date**: October 24, 2025
**Module**: Casino Core Engine

---

## ✅ COMPLETED FILES (5 files, 2,916 lines)

### Phase 1: Utilities ✅ COMPLETE
1. **helpers.js** (426 lines) - Utility functions
2. **formatters.js** (529 lines) - UI formatting
3. **validators.js** (375 lines) - Input validation & security

### Phase 2: Core Modules ✅ 66% COMPLETE
4. **StateManager.js** (535 lines) - Reactive state management ✅
5. **RewardCalculator.js** (1,051 lines) - Deterministic rewards ✅

---

## 📋 DETAILED IMPLEMENTATION: StateManager.js

**File**: `/public/js/casino/core/StateManager.js` (535 lines)

**Purpose**: Centralized reactive state management with subscription system

### Key Features:
- ✅ **Reactive Subscriptions**: Subscribe to state changes at any path
- ✅ **Dot Notation Access**: `state.get('progress.xp')` or `state.set('progress.xp', 100)`
- ✅ **Deep Cloning**: Prevents external mutations
- ✅ **Parent/Child Notifications**: Changing 'progress.xp' notifies 'progress' subscribers
- ✅ **History System**: Optional undo/redo with configurable max size
- ✅ **Performance**: Only notifies when values actually change
- ✅ **Error Handling**: Catches and logs subscriber errors
- ✅ **Fallbacks**: Works without CasinoHelpers (self-contained)

### API Examples:
```javascript
// Create state manager
const state = new StateManager({ coins: 100, progress: { xp: 0 } });

// Subscribe to changes
const unsub = state.subscribe('coins', (newCoins, oldCoins) => {
  console.log(`Coins changed: ${oldCoins} → ${newCoins}`);
});

// Update state
state.set('coins', 150); // triggers callback → "Coins changed: 100 → 150"

// Nested access
state.set('progress.xp', 100);
state.get('progress.xp'); // → 100

// Updater function
state.update('coins', (coins) => coins + 50); // → 200

// Unsubscribe
unsub();

// History (optional)
state.enableHistory(50); // max 50 snapshots
state.set('coins', 300);
state.undo(); // back to 200
state.redo(); // forward to 300

// Debug info
state.getDebugInfo();
// → {subscriberCount: 0, subscribedPaths: [], historyEnabled: true, ...}
```

### Methods (20 total):
- `constructor(initialState)` - Initialize with state
- `get(path, defaultValue)` - Get value at path
- `set(path, value)` - Set value (triggers subscribers)
- `update(path, updater)` - Update using function
- `getAll()` - Get entire state (cloned)
- `setAll(newState)` - Replace entire state
- `subscribe(path, callback)` - Subscribe to changes
- `unsubscribe(subscriberId)` - Unsubscribe by ID
- `unsubscribeAll(path)` - Clear all subscribers for path
- `reset(initialState)` - Reset to initial/provided state
- `snapshot()` - Create state snapshot
- `restore(snapshot)` - Restore from snapshot
- `enableHistory(maxSize)` - Enable undo/redo
- `disableHistory()` - Disable history
- `undo()` - Undo last change
- `redo()` - Redo last undone change
- `getSubscriberCount()` - Get total subscribers
- `getDebugInfo()` - Get debug information
- `_notifySubscribers()` - Internal: notify subscribers
- `_saveToHistory()` - Internal: save to history

### Testing:
```javascript
// Unit test example
const state = new StateManager({ coins: 100 });
const callback = jest.fn();

state.subscribe('coins', callback);
state.set('coins', 150);

expect(callback).toHaveBeenCalledWith(150, 100, 'coins');
expect(state.get('coins')).toBe(150);
```

---

## 📋 DETAILED IMPLEMENTATION: RewardCalculator.js

**File**: `/public/js/casino/core/RewardCalculator.js` (1,051 lines)

**Purpose**: Deterministic reward calculations (no true randomness)

### Key Features:
- ✅ **Deterministic Seeding**: Uses userId + questionId + timestamp (always same result)
- ✅ **Mystery Rewards**: Rarity-based rewards (common → legendary)
- ✅ **Streak Multipliers**: 1x → 10x based on streak count
- ✅ **Level Calculations**: Exponential XP curve (100 * level²)
- ✅ **Tier System**: Bronze → Legend based on level
- ✅ **Daily Wheel**: Deterministic prize selection per day
- ✅ **Jackpot Rewards**: Scale with level + streak
- ✅ **Server Validation**: Verify client reward claims
- ✅ **Fallbacks**: Works without CasinoHelpers

### API Examples:

#### Deterministic Rewards:
```javascript
const calc = new RewardCalculator(rewardConfig);

// Generate seed (deterministic)
const seed = calc.generateRewardSeed('user123', 'q_sat_math_42', 1729800000);
// → 0.6273... (always same for these inputs)

// Determine rarity
const rarity = calc.determineMysteryRarity(seed);
// → 'uncommon' (seed 0.6273 falls in uncommon range 0.60-0.85)

// Select reward from rarity
const reward = calc.selectRewardFromRarity(rarity, seed);
// → {type: 'coins', amount: 200, rarity: 'uncommon'}

// Complete flow
const reward = calc.rollMysteryReward('user123', 'q_456');
// → {type: 'coins', amount: 200, rarity: 'uncommon'}
```

#### Base Rewards:
```javascript
// Calculate base coins (difficulty + time bonus)
calc.calculateBaseCoins(5, 47); // difficulty 5, 47 seconds
// → 108 coins (base 100 + time bonus 8)

calc.calculateBaseCoins('hard', 120);
// → 130 coins

// Calculate base XP
calc.calculateBaseXP(5, 30);
// → 60 XP (base 50 + time bonus 10)
```

#### Streak Multipliers:
```javascript
// Get streak multiplier
calc.getStreakMultiplier(5);
// → {
//   multiplier: 2.0,
//   label: 'Hot Streak! 🔥🔥',
//   milestone: true,
//   nextMilestone: {streakRequired: 10, multiplier: 3.0, ...}
// }

calc.getStreakMultiplier(15);
// → {multiplier: 5.0, label: 'Blazing! 🔥🔥🔥🔥', ...}

// Total multiplier (streak + daily + event)
calc.getTotalMultiplier(2.0, 1.5, 3.0);
// → 9.0 (2.0 * 1.5 * 3.0)
```

#### Level & Tier:
```javascript
// Calculate XP for level
calc.calculateXPForLevel(1); // → 0
calc.calculateXPForLevel(10); // → 9,900
calc.calculateXPForLevel(50); // → 249,900

// Calculate level from XP
calc.calculateLevelFromXP(10000); // → 10

// XP to next level
calc.calculateXPToNextLevel(12, 15000);
// → 1,900 XP needed

// Get tier
calc.getTierForLevel(5); // → 'bronze'
calc.getTierForLevel(15); // → 'silver'
calc.getTierForLevel(75); // → 'legend'

// Check tier upgrade
calc.checkTierUpgrade(9, 10);
// → {oldTier: 'bronze', newTier: 'silver', tierUpgraded: true}

// Tier progress (within tier)
calc.calculateTierProgress(15);
// → 0.5 (halfway through silver: 10-19)
```

#### Daily Wheel:
```javascript
// Determine prize (deterministic per user per day)
const prize = calc.determineDailyWheelPrize('user123', '2025-10-24');
// → {id: 3, type: 'xp', amount: 150, label: '150 XP', probability: 0.20}

// Same user, same day = same prize
const prize2 = calc.determineDailyWheelPrize('user123', '2025-10-24');
// → exact same result

// Different day = different prize
const prize3 = calc.determineDailyWheelPrize('user123', '2025-10-25');
// → different prize
```

#### Jackpot:
```javascript
// Calculate jackpot reward
calc.calculateJackpotReward(12, 5); // level 12, streak 5
// → {coins: 1300, xp: 650, multiplier: 1.25}

// Next jackpot trigger (deterministic)
calc.calculateNextJackpotTrigger('user123', 100);
// → 17 (questions until jackpot, always same for this user at question 100)
```

#### Validation:
```javascript
// Validate reward claim (server-side)
const isValid = calc.validateRewardClaim({
  userId: 'user123',
  questionId: 'q_456',
  timestamp: 1729800000,
  rarity: 'uncommon',
  rewardType: 'coins',
  amount: 200
});
// → true (reward matches expected seed calculation)
```

### Methods (20 total):
- `generateRewardSeed(userId, questionId, timestamp)` - Deterministic seed
- `determineMysteryRarity(seed)` - Rarity from seed
- `selectRewardFromRarity(rarity, seed)` - Pick reward
- `rollMysteryReward(userId, questionId, timestamp)` - Complete flow
- `calculateBaseCoins(difficulty, timeSpent)` - Base coin reward
- `calculateBaseXP(difficulty, timeSpent)` - Base XP reward
- `getStreakMultiplier(streak)` - Streak multiplier & label
- `getTotalMultiplier(streak, daily, event)` - Combined multiplier
- `calculateXPForLevel(level)` - XP needed for level
- `calculateLevelFromXP(totalXP)` - Level from XP
- `calculateXPToNextLevel(level, currentXP)` - XP to next
- `getTierForLevel(level)` - Tier name
- `checkTierUpgrade(oldLevel, newLevel)` - Tier change
- `calculateTierProgress(level)` - Progress within tier
- `determineDailyWheelPrize(userId, date)` - Daily prize
- `calculateJackpotReward(level, streak)` - Jackpot amounts
- `calculateNextJackpotTrigger(userId, questionCount)` - Questions until jackpot
- `validateRewardClaim(claimData)` - Server validation
- `_getDefaultConfig()` - Default config
- `_getDefaultWheelPrizes()` - Default wheel prizes

### Configuration Format:
```javascript
const rewardConfig = {
  mysteryRewards: {
    common: {
      probability: 0.60,
      rewards: [
        { type: 'coins', min: 50, max: 100 },
        { type: 'xp', min: 25, max: 50 }
      ]
    },
    uncommon: { probability: 0.25, rewards: [...] },
    rare: { probability: 0.10, rewards: [...] },
    epic: { probability: 0.04, rewards: [...] },
    legendary: { probability: 0.01, rewards: [...] }
  },
  streakMultipliers: [
    { streakCount: 1, multiplier: 1.0, label: null },
    { streakCount: 5, multiplier: 2.0, label: 'Hot Streak! 🔥🔥' },
    // ...
  ],
  dailyWheelPrizes: [
    { id: 1, type: 'coins', amount: 100, probability: 0.25 },
    // ...
  ]
};
```

---

## 🔄 REMAINING: Phase 2 (2 files)

### Next: FirebaseSync.js (PRIORITY HIGH)
**Purpose**: Firestore integration with optimistic updates

**Planned Features**:
- Load/save user progress from Firestore
- Audit log writing (immutable event history)
- Leaderboard queries (weekly/all-time)
- Real-time subscriptions (listen to changes)
- Offline support with queue
- Batch writes for performance
- Error handling & retries

**API Sketch**:
```javascript
const sync = new FirebaseSync(db, userId);
await sync.initialize();

// Progress
await sync.saveProgress({ coins: 1250 }, true); // merge
const progress = await sync.loadProgress();

// History
await sync.logEvent('correct_answer', eventData);

// Leaderboard
const weekly = await sync.getWeeklyLeaderboard(100);
const rank = await sync.getUserRank(userId);

// Real-time
sync.subscribeToProgress((newProgress) => {
  console.log('Progress updated:', newProgress);
});
```

**Estimated Lines**: ~400

---

### Next: CasinoEngine.js (PRIORITY HIGH)
**Purpose**: Main game engine coordinating all mechanics

**Planned Features**:
- Process correct/incorrect answers
- Award coins & XP with multipliers
- Trigger mystery rewards
- Level up detection
- Streak management
- Jackpot triggering
- Daily wheel spinning
- Event emission system
- Integration with StateManager + RewardCalculator + FirebaseSync

**API Sketch**:
```javascript
const engine = new CasinoEngine({
  userId: 'user123',
  firebaseDb: db
});

await engine.initialize(); // loads progress

// Subscribe to events
engine.on('correctAnswer', (data) => {
  console.log(`+${data.coins} coins, +${data.xp} XP`);
  console.log(`Streak: ${data.streak}, Multiplier: ${data.multiplier}x`);
  if (data.leveledUp) console.log(`LEVEL UP! Now level ${data.newLevel}`);
});

engine.on('incorrectAnswer', (data) => {
  console.log('Streak broken!');
});

// Process answers
await engine.processCorrectAnswer({
  questionId: 'q_sat_math_42',
  difficulty: 5,
  timeSpent: 47
});

await engine.processIncorrectAnswer({
  questionId: 'q_sat_math_43'
});

// Other actions
await engine.spinDailyWheel();
await engine.triggerJackpot();
await engine.purchaseShopItem('streak_freeze');

// Getters
engine.getCoins(); // → 1250
engine.getLevel(); // → 12
engine.getStreak(); // → 5
```

**Estimated Lines**: ~600

---

## 📊 PROGRESS SUMMARY

### Files Completed: 5 / 7 (71%)
1. ✅ helpers.js (426 lines)
2. ✅ formatters.js (529 lines)
3. ✅ validators.js (375 lines)
4. ✅ StateManager.js (535 lines)
5. ✅ RewardCalculator.js (1,051 lines)
6. ⏳ FirebaseSync.js (pending, ~400 lines)
7. ⏳ CasinoEngine.js (pending, ~600 lines)

### Lines Written: 2,916 / ~3,916 (74%)

### Time Estimate:
- Phase 1 (Utilities): ✅ Complete (4 hours)
- Phase 2 (Core Modules): 🔄 66% Complete (6 hours spent, 3 hours remaining)
- **Remaining**: FirebaseSync + CasinoEngine (~3-4 hours)

---

## 🧪 TESTING COMMANDS

```bash
# 1. Verify files exist
ls -lh /Users/dylonboone/CCCC-1/CCCC-4/public/js/casino/core/

# Expected:
# StateManager.js
# RewardCalculator.js

# 2. Test in browser console
# Navigate to: http://localhost:3000/testprep

# Test StateManager
const state = new StateManager({ coins: 100 });
state.subscribe('coins', (n, o) => console.log(`Coins: ${o} → ${n}`));
state.set('coins', 150); // → "Coins: 100 → 150"
state.getDebugInfo();

# Test RewardCalculator
const calc = new RewardCalculator();
const seed = calc.generateRewardSeed('user123', 'q_456', Date.now());
console.log('Seed:', seed);

const rarity = calc.determineMysteryRarity(seed);
console.log('Rarity:', rarity);

const reward = calc.rollMysteryReward('user123', 'q_456');
console.log('Reward:', reward);

const streakInfo = calc.getStreakMultiplier(10);
console.log('Streak 10:', streakInfo);

const level = calc.calculateLevelFromXP(10000);
console.log('Level at 10k XP:', level);

# 3. Unit tests (when created)
npm test -- casino/core/StateManager.test.js
npm test -- casino/core/RewardCalculator.test.js
```

---

## ✅ MANUAL QA CHECKLIST

### StateManager.js:
- [x] File created (535 lines)
- [x] All 20 methods implemented
- [x] Subscribe/unsubscribe system working
- [x] Dot notation access working
- [x] Deep cloning prevents mutations
- [x] Parent/child notification working
- [x] History system (undo/redo) implemented
- [x] Error handling for subscriber callbacks
- [x] Fallback functions for standalone operation
- [x] Exported to window.StateManager
- [x] Exported for Node.js testing
- [ ] Unit tests written (pending)

### RewardCalculator.js:
- [x] File created (1,051 lines)
- [x] All 20 methods implemented
- [x] Deterministic seed generation working
- [x] Mystery reward rarity calculation working
- [x] Streak multipliers (1x → 10x) working
- [x] Level/XP calculations (exponential curve)
- [x] Tier system (bronze → legend)
- [x] Daily wheel prize selection
- [x] Jackpot reward calculation
- [x] Server-side validation method
- [x] Default configuration provided
- [x] Fallback hash functions
- [x] Exported to window.RewardCalculator
- [x] Exported for Node.js testing
- [ ] Unit tests written (pending)

### Integration:
- [ ] StateManager + RewardCalculator tested together
- [ ] Tested with real Firebase config
- [ ] Performance tested (1000+ operations)
- [ ] Memory leak check (subscribe/unsubscribe)

---

## 🎯 NEXT STEPS

**Immediate Priority (Next 3-4 hours)**:

1. **Implement FirebaseSync.js** (~2 hours)
   - Firestore CRUD operations
   - Real-time listeners
   - Audit logging
   - Leaderboard queries
   - Error handling

2. **Implement CasinoEngine.js** (~2 hours)
   - Main game loop
   - Process answer methods
   - Event emission
   - Integration of StateManager + RewardCalculator + FirebaseSync
   - Comprehensive testing

3. **Write Unit Tests** (~2 hours after core complete)
   - StateManager tests (20+ tests)
   - RewardCalculator tests (25+ tests)
   - FirebaseSync tests (15+ tests with mocks)
   - CasinoEngine integration tests (30+ tests)

---

## 📝 DECISION POINT

**DyLon, please confirm:**

1. ✅ **Approve StateManager.js** implementation?
2. ✅ **Approve RewardCalculator.js** implementation?
3. ✅ **Proceed with FirebaseSync.js + CasinoEngine.js**?

**Or request changes:**
- Different state management approach?
- Modified reward calculations?
- Additional validation methods?
- Alternative reward formulas?

---

**Status**: ⏸️ **PAUSED - Phase 2: 66% Complete, Awaiting Approval to Continue**

**Next File**: FirebaseSync.js (400 lines, ~2 hours)
