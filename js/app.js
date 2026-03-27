let ably = null;
let userName = '';
let myTeam = '';
let globalShouts = { team1: 0, team2: 0 };
let recentShouts = { team1: [], team2: [] };
let warnings = 0;
let blockedUntil = 0;
let isAdmin = false;
let matchConfig = null;
let countdownInterval = null;
let pollResults = [];
let pollTimerId = null;
let pollCloseTimeoutId = null;
let lastPollSavedTimestamp = null;
let connectionStatus = 'disconnected';
let userShouts = {};
let myShoutCount = 0;
const MAX_RECENT_SHOUTS = 1000;
const RECENT_SHOUTS_WINDOW_MS = 60000;

const ADMIN_PASSWORD = 'Blackhat@1';
const ABLY_API_KEY = 'HMdoSg.71SSBA:aPHMDOC3iAFJ6jx1wEp0eXM56hCxSljcUWUm97DLPJU';

const profanityList = /\b(madarchod|behenchod|bhosda|bsdk|gaandu|chutiya|gandu|lundy|kutta|kum|laude|randi|sex|sexy|porn|xxx|fuck|shit|damn|bitch|ass|bastard|dick|piss)\b/gi;

const pollScenarios = [
    { q: "Who wins the powerplay?", t1: "Team 1", t2: "Team 2" },
    { q: "Most sixes today?", t1: "Team 1", t2: "Team 2" },
    { q: "Most fours today?", t1: "Team 1", t2: "Team 2" },
    { q: "Who wins the match?", t1: "Team 1", t2: "Team 2" },
    { q: "First wicket method?", t1: "Bowled", t2: "Caught" },
    { q: "Wicket in next over?", t1: "Yes", t2: "No" },
    { q: "Six in next over?", t1: "Yes", t2: "No" },
    { q: "Boundary in next over?", t1: "Yes", t2: "No" },
    { q: "Match goes to Super Over?", t1: "Yes", t2: "No" },
    { q: "Player of match?", t1: "Team 1", t2: "Team 2" },
    { q: "Highest individual score?", t1: "Team 1", t2: "Team 2" },
    { q: "Most dot balls?", t1: "Team 1", t2: "Team 2" },
    { q: "Wides > 2?", t1: "Yes", t2: "No" },
    { q: "No-ball in powerplay?", t1: "Yes", t2: "No" },
    { q: "50 runs in first 6 overs?", t1: "Yes", t2: "No" },
    { q: "100 runs in first 10 overs?", t1: "Yes", t2: "No" },
    { q: "Highest partnership?", t1: "Team 1", t2: "Team 2" },
    { q: "First dismissal?", t1: "Catch", t2: "Bowled" },
    { q: "Run-out chance?", t1: "Yes", t2: "No" },
    { q: "Final score over 160?", t1: "Yes", t2: "No" },
    { q: "Who hits more boundaries?", t1: "Team 1", t2: "Team 2" },
    { q: "Most extras?", t1: "Team 1", t2: "Team 2" },
    { q: "Fall of first wicket?", t1: "Under 30", t2: "30+" },
    { q: "Powerplay score?", t1: "Under 40", t2: "40+" }
];

const allTeamSledges = {
    'RCB': ["Ee Sala Cup Namde!", "Kohli Aaya!", "RCB Till I Die!", "Patidar on Fire!", "Salt & Spice!", "RCB Zindabad!", "Bangalore Bhaijaan!"],
    'SRH': ["Orange Army Rising!", "Travis Head Show!", "SRH Till I Die!", "Cummins Magic!", "Klaasen Khelo!", "Hyderabad Humara!", "SRH Zindabad!"],
    'CSK': ["Thala Dhoni!", "CSK till I die!", "Whistle Podu Army!", "Jadeja Magic!", "Chennai超级!", "CSK Zindabad!", "Super Kings!"],
    'MI': ["Mumbai Indians!", "Kapil Dev Power!", "MI till I die!", "Rohit Sharma!", "Ambani Army!", "Play like a champion!", "Mumbai Indians Zindabad!"],
    'KKR': ["Kolkata Knight Riders!", "KKR Fighters!", "Shah Rukh's Army!", "Russell Storm!", "KKR Zindabad!", "Yellow & Purple!", "KKR Till I Die!"],
    'DC': ["Delhi Capitals!", "Pant Party!", "DC till I die!", "Warner Power!", "Delhi Dynamos!", "DC Zindabad!", "Capitals Fight!"],
    'LSG': ["Lucknow Super Giants!", "LSG Army!", "Pant & Pandya!", "LSG Zindabad!", "Super Giants!", "Lucknow Loud!", "LSG Till I Die!"],
    'GT': ["Gujarat Titans!", "Titans Rule!", "Shubman Gill!", "GT Zindabad!", "Gujarat Giants!", "Titans Attack!", "GT till I die!"],
    'RR': ["Rajasthan Royals!", "RR Fighters!", "Sanju Samson!", "RR Zindabad!", "Pink Army!", "Rajasthan Thunder!", "RR Till I Die!"],
    'PBKS': ["Punjab Kings!", "PBKS Army!", "Shubhman Gill!", "Punjab Zindabad!", "Kings XI Punjab!", "PBKS Fight!", "PBKS till I die!"]
};

function getSledgesForTeam(teamShort) {
    return allTeamSledges[teamShort] || ["Go Team Go!", "We are the best!", "Let's do this!", "Game Time!"];
}

const emojis = [
    // Cricket emojis
    '🏏', '🎯', '💥', '🏆', '🎉', '🙌', '🔥', '⚡',
    '🎰', '🌟', '💪', '👊', '✌️', '🤞', '🤝', '👏',
    // Celebration
    '🎊', '🎁', '🥳', '😎', '🤩', '😤', '😂', '🤣',
    // Sports
    '⚽', '🏀', '🎾', '🏐', '🏈', '🎱', '🏓', '🏸',
    // Expressions
    '❤️', '💯', '🚀', '💫', '🌈', '🌊', '🔥', '⭐'
];

const iplSchedule = [
    { match: "Match 1", date: "2026-03-28", time: "19:30", team1: "RCB", team1Full: "Royal Challengers Bengaluru", team2: "SRH", team2Full: "Sunrisers Hyderabad", venue: "M Chinnaswamy Stadium" },
    { match: "Match 2", date: "2026-03-29", time: "19:30", team1: "MI", team1Full: "Mumbai Indians", team2: "KKR", team2Full: "Kolkata Knight Riders", venue: "Wankhede Stadium" },
    { match: "Match 3", date: "2026-03-30", time: "19:30", team1: "RR", team1Full: "Rajasthan Royals", team2: "CSK", team2Full: "Chennai Super Kings", venue: "ACA Stadium" },
    { match: "Match 4", date: "2026-03-31", time: "19:30", team1: "PBKS", team1Full: "Punjab Kings", team2: "GT", team2Full: "Gujarat Titans", venue: "New Chandigarh Stadium" },
    { match: "Match 5", date: "2026-04-01", time: "19:30", team1: "LSG", team1Full: "Lucknow Super Giants", team2: "DC", team2Full: "Delhi Capitals", venue: "Lucknow Stadium" },
    { match: "Match 6", date: "2026-04-02", time: "19:30", team1: "KKR", team1Full: "Kolkata Knight Riders", team2: "SRH", team2Full: "Sunrisers Hyderabad", venue: "Eden Gardens" },
    { match: "Match 7", date: "2026-04-03", time: "19:30", team1: "CSK", team1Full: "Chennai Super Kings", team2: "PBKS", team2Full: "Punjab Kings", venue: "Chepauk" },
    { match: "Match 8", date: "2026-04-04", time: "15:30", team1: "DC", team1Full: "Delhi Capitals", team2: "MI", team2Full: "Mumbai Indians", venue: "Arun Jaitley Stadium" },
    { match: "Match 9", date: "2026-04-04", time: "19:30", team1: "GT", team1Full: "Gujarat Titans", team2: "RR", team2Full: "Rajasthan Royals", venue: "Narendra Modi Stadium" },
    { match: "Match 10", date: "2026-04-05", time: "15:30", team1: "SRH", team1Full: "Sunrisers Hyderabad", team2: "LSG", team2Full: "Lucknow Super Giants", venue: "Hyderabad Stadium" }
];

const teamColors = {
    'RCB': { primary: '#8B0000', secondary: '#FFD700' },
    'SRH': { primary: '#FF4500', secondary: '#1a1a1a' },
    'CSK': { primary: '#FECE00', secondary: '#094CB8' },
    'MI': { primary: '#004BA0', secondary: '#F3C612' },
    'KKR': { primary: '#4a0080', secondary: '#ffd700' },
    'DC': { primary: '#dd1e25', secondary: '#f5f5f5' },
    'LSG': { primary: '#00a86b', secondary: '#f5f5f5' },
    'GT': { primary: '#d4af37', secondary: '#1a1a1a' },
    'RR': { primary: '#e91e63', secondary: '#1a1a1a' },
    'PBKS': { primary: '#ed1c24', secondary: '#f5f5f5' }
};

function updateConnectionStatus(status) {
    connectionStatus = status;
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    if (!statusDot || !statusText) return;
    
    statusDot.className = 'status-dot';
    switch (status) {
        case 'connected':
            statusDot.classList.add('connected');
            statusText.textContent = 'Live';
            break;
        case 'connecting':
            statusDot.classList.add('connecting');
            statusText.textContent = 'Connecting...';
            break;
        case 'disconnected':
            statusDot.classList.add('disconnected');
            statusText.textContent = 'Offline';
            break;
        case 'failed':
            statusDot.classList.add('failed');
            statusText.textContent = 'Connection Failed';
            break;
    }
}

async function initAbly() {
    try {
        updateConnectionStatus('connecting');
        
        ably = new Ably.Realtime({
            key: ABLY_API_KEY,
            clientId: userName || 'anonymous',
            closeOnUnload: true,
            recover: true
        });
        
        ably.connection.on('connected', () => {
            console.log('Connected to Ably!');
            updateConnectionStatus('connected');
            setupPresence();
            subscribeToMatchConfig();
            subscribeToChannels();
            subscribeToPolls();
            subscribeToWarriorStats();
            
            if (isAdmin) {
                setupAdminChannel();
                populateMatchSelect();
            }
        });
        
        ably.connection.on('disconnected', () => {
            console.log('Ably disconnected');
            updateConnectionStatus('disconnected');
        });
        
        ably.connection.on('suspended', () => {
            console.log('Ably suspended');
            updateConnectionStatus('disconnected');
        });
        
        ably.connection.on('failed', (err) => {
            console.error('Ably connection failed:', err);
            updateConnectionStatus('failed');
        });
        
    } catch (error) {
        console.error('Failed to connect to Ably:', error);
        updateConnectionStatus('failed');
    }
}

function initializeDefaultMatch() {
    const firstMatch = iplSchedule[0];
    const matchTimeIST = `${firstMatch.date}T${firstMatch.time}:00+05:30`;
    
    matchConfig = {
        team1: { short: firstMatch.team1, full: firstMatch.team1Full },
        team2: { short: firstMatch.team2, full: firstMatch.team2Full },
        matchTime: matchTimeIST,
        venue: firstMatch.venue,
        matchNumber: firstMatch.match
    };
    
    applyMatchConfig();
}

function setupPresence() {
    const presenceChannel = ably.channels.get('presence');
    
    presenceChannel.presence.enter(userName, (err) => {
        if (err) console.error('Presence enter error:', err);
    });
    
    presenceChannel.presence.subscribe('members', (msg) => {
        document.getElementById('live-count').innerText = msg.members.length;
    });
    
    presenceChannel.presence.get((err, members) => {
        if (!err) document.getElementById('live-count').innerText = members.length;
    });
}

function subscribeToMatchConfig() {
    const configChannel = ably.channels.get('match-config');
    
    configChannel.subscribe('config-update', (msg) => {
        matchConfig = { ...matchConfig, ...msg.data };
        applyMatchConfig();
    });
}

function applyMatchConfig() {
    if (!matchConfig) return;
    
    const t1 = matchConfig.team1 || {};
    const t2 = matchConfig.team2 || {};
    
    document.getElementById('team1-fullname').innerText = t1.full || 'Team 1';
    document.getElementById('team2-fullname').innerText = t2.full || 'Team 2';
    document.getElementById('match-number').innerText = matchConfig.matchNumber || 'Match 1';
    document.getElementById('venue-display').innerText = matchConfig.venue || 'TBD';
    
    document.getElementById('poll-btn-team1').innerText = t1.short || 'Team 1';
    document.getElementById('poll-btn-team2').innerText = t2.short || 'Team 2';
    
    if (t1.logo) {
        document.getElementById('team1-header-logo').src = t1.logo;
    }
    if (t2.logo) {
        document.getElementById('team2-header-logo').src = t2.logo;
    }
    
    setupEmojiPicker('team1');
    setupEmojiPicker('team2');
    generateSledgeBar('team1', getSledgesForTeam(t1.short));
    generateSledgeBar('team2', getSledgesForTeam(t2.short));
    
    if (t1.short && teamColors[t1.short]) {
        document.documentElement.style.setProperty('--team1-primary', teamColors[t1.short].primary);
        document.documentElement.style.setProperty('--team1-secondary', teamColors[t1.short].secondary);
    }
    if (t2.short && teamColors[t2.short]) {
        document.documentElement.style.setProperty('--team2-primary', teamColors[t2.short].primary);
        document.documentElement.style.setProperty('--team2-secondary', teamColors[t2.short].secondary);
    }
}

function setupEmojiPicker(team) {
    let picker;
    if (team === 'unified') {
        picker = document.getElementById('unified-emoji-picker');
    } else {
        picker = document.getElementById(`${team}-emoji-picker`);
    }
    if (!picker) return;
    picker.innerHTML = emojis.map(e => `<span class="emoji" onclick="insertEmoji('${team}', '${e}')">${e}</span>`).join('');
}

function generateSledgeBar(team, sledges) {
    const track = document.getElementById(`${team}-sledges`);
    if (!track) return;
    track.innerHTML = sledges.map(s => `<button class="sledge-chip" onclick="sendSledge('${team}', '${s}')">${s}</button>`).join('');
}

function subscribeToChannels() {
    const team1Channel = ably.channels.get('team1-war-room');
    const team2Channel = ably.channels.get('team2-war-room');

    team1Channel.subscribe('message', (msg) => {
        addUnifiedMessage('team1', msg.data);
    });
    team2Channel.subscribe('message', (msg) => {
        addUnifiedMessage('team2', msg.data);
    });
    team1Channel.subscribe('shout', () => handleShout('team1'));
    team2Channel.subscribe('shout', () => handleShout('team2'));
}

function subscribeToPolls() {
    const pollChannel = ably.channels.get('poll-votes');
    pollChannel.subscribe('new-poll', (msg) => showPollModal(msg.data));
    pollChannel.subscribe('vote-update', (msg) => updatePollDisplay(msg.data));
    pollChannel.subscribe('poll-closed', (msg) => handlePollClosed(msg.data));
}

async function startPollTimer() {
    // Don't start poll timer - polls will be triggered when match starts
}

function checkMatchStarted() {
    const matchTime = matchConfig?.matchTime || '2026-03-28T19:30:00+05:30';
    const target = new Date(matchTime).getTime();
    const now = Date.now();
    return now >= target;
}

async function checkExistingPoll() {
    if (!ably || ably.connection.state !== 'connected') return null;
    
    try {
        const pollChannel = ably.channels.get('poll-votes');
        const messages = await pollChannel.history({ limit: 1, direction: 'backwards' });
        
        if (messages.items && messages.items.length > 0) {
            const lastMsg = messages.items[0];
            const now = Date.now();
            const pollTime = lastMsg.data.timestamp || 0;
            
            // If poll is less than 15 minutes old, use it
            if (now - pollTime < 900000) {
                return lastMsg.data;
            }
        }
    } catch (e) {
        console.log('No existing poll found');
    }
    return null;
}

async function triggerRandomPoll() {
    // Only trigger poll when match has started
    if (!checkMatchStarted()) {
        console.log('Match not started yet, waiting for countdown...');
        return;
    }
    
    if (window.currentPoll) return;

    // Check for existing poll from other users first
    const existingPoll = await checkExistingPoll();
    if (existingPoll) {
        showPollModal(existingPoll);
        return;
    }
    if (existingPoll) {
        showPollModal(existingPoll);
        return;
    }

    const scenario = pollScenarios[Math.floor(Math.random() * pollScenarios.length)];
    const t1 = matchConfig?.team1?.short || 'Team 1';
    const t2 = matchConfig?.team2?.short || 'Team 2';
    
    const pollData = {
        question: scenario.q,
        option1: scenario.t1,
        option2: scenario.t2,
        team1Votes: 0,
        team2Votes: 0,
        timestamp: Date.now(),
        pollId: 'poll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };
    
    ably.channels.get('poll-votes').publish('new-poll', pollData);

    showPollModal(pollData);
    
    if (pollCloseTimeoutId) clearTimeout(pollCloseTimeoutId);
    pollCloseTimeoutId = setTimeout(() => {
        closePoll();
    }, 30000);
}

function showPollModal(data) {
    if (window.currentPoll?.pollId && data?.pollId && window.currentPoll.pollId === data.pollId) {
        return;
    }

    if (window.currentPoll?.timestamp && data?.timestamp && window.currentPoll.timestamp === data.timestamp) {
        return;
    }

    document.getElementById('poll-question').innerText = data.question;
    document.getElementById('poll-btn-team1').innerText = data.option1 || (matchConfig?.team1?.short || 'Team 1');
    document.getElementById('poll-btn-team2').innerText = data.option2 || (matchConfig?.team2?.short || 'Team 2');
    
    document.getElementById('poll-live-team1').style.width = '50%';
    document.getElementById('poll-live-team2').style.width = '50%';
    document.getElementById('poll-pct-team1').innerText = '50%';
    document.getElementById('poll-pct-team2').innerText = '50%';
    
    window.currentPoll = data;
    
    const modal = new bootstrap.Modal(document.getElementById('pollModal'));
    modal.show();
    
    window.currentPollModal = modal;
}

function votePoll(team) {
    if (!window.currentPoll) return;
    
    const pollChannel = ably.channels.get('poll-votes');
    
    if (team === 'team1') {
        window.currentPoll.team1Votes++;
    } else {
        window.currentPoll.team2Votes++;
    }
    
    pollChannel.publish('vote', { team: team, poll: window.currentPoll });
    
    updatePollDisplay(window.currentPoll);
    updatePollWidgetDisplay(window.currentPoll);
    
    setTimeout(() => {
        if (window.currentPollModal) {
            window.currentPollModal.hide();
            window.currentPollModal = null;
        }
    }, 500);
}

function updatePollWidgetDisplay(data) {
    const container = document.getElementById('poll-results-display');
    if (!container || !data) return;
    
    const total = data.team1Votes + data.team2Votes;
    const t1Pct = total === 0 ? 50 : Math.round((data.team1Votes / total) * 100);
    const t2Pct = total === 0 ? 50 : Math.round((data.team2Votes / total) * 100);
    
    const t1 = data.option1 || 'Team 1';
    const t2 = data.option2 || 'Team 2';
    
    container.innerHTML = `
        <div class="poll-question-mini">${escapeHtml(data.question)}</div>
        <div class="poll-result-bar">
            <span class="poll-result-t1">${t1}: ${t1Pct}%</span>
            <span class="poll-result-vs">VS</span>
            <span class="poll-result-t2">${t2}: ${t2Pct}%</span>
        </div>
    `;
}

function updatePollDisplay(data) {
    const total = data.team1Votes + data.team2Votes;
    if (total === 0) return;
    
    const t1Pct = Math.round((data.team1Votes / total) * 100);
    const t2Pct = Math.round((data.team2Votes / total) * 100);
    
    document.getElementById('poll-live-team1').style.width = t1Pct + '%';
    document.getElementById('poll-live-team2').style.width = t2Pct + '%';
    document.getElementById('poll-pct-team1').innerText = t1Pct + '%';
    document.getElementById('poll-pct-team2').innerText = t2Pct + '%';
}

function handlePollClosed(data) {
    // Always ensure the modal is not left open (fixes "stuck after poll response").
    if (pollCloseTimeoutId) {
        clearTimeout(pollCloseTimeoutId);
        pollCloseTimeoutId = null;
    }

    if (window.currentPollModal) {
        window.currentPollModal.hide();
        window.currentPollModal = null;
    }

    window.currentPoll = null;
    savePollResult(data);
}

function closePoll() {
    if (!window.currentPoll) return;
    const data = window.currentPoll;

    handlePollClosed(data);
    ably.channels.get('poll-votes').publish('poll-closed', data);
}

function savePollResult(data) {
    if (!data) return;

    // Only keep the last poll's histogram.
    if (typeof data.timestamp !== 'undefined') {
        if (data.timestamp === lastPollSavedTimestamp) return;
        lastPollSavedTimestamp = data.timestamp;
    }

    const result = {
        question: data.question.substring(0, 25) + '...',
        team1: data.option1,
        team2: data.option2,
        team1Pct: data.team1Votes,
        team2Pct: data.team2Votes
    };

    pollResults = [result];
    
    updatePollResultsDisplay();
}

function updatePollResultsDisplay() {
    const el1 = document.getElementById('poll-result-1');
    const el2 = document.getElementById('poll-result-2');
    const el3 = document.getElementById('poll-result-3');

    if (!pollResults[0]) {
        el1.innerHTML = '';
        el2.innerHTML = '';
        el3.innerHTML = '';
        return;
    }

    const total = pollResults[0].team1Pct + pollResults[0].team2Pct;
    const t1Pct = total === 0 ? 50 : Math.round((pollResults[0].team1Pct / total) * 100);
    const t2Pct = total === 0 ? 50 : Math.round((pollResults[0].team2Pct / total) * 100);

    el1.innerHTML = `
        <span>${pollResults[0].question}</span>
        <span class="result-bar result-team1" style="width:${t1Pct}px"></span>
        <span>${t1Pct}%</span>
        <span>vs</span>
        <span class="result-bar result-team2" style="width:${t2Pct}px"></span>
        <span>${t2Pct}%</span>
    `;

    // Only the latest poll shows in histogram form.
    el2.innerHTML = '';
    el3.innerHTML = '';
}

function addMessage(team, data) {
    const container = document.getElementById(`${team}-chat`);
    if (container) {
        const div = document.createElement('div');
        div.className = 'chat-message' + (data.isWarning ? ' warning' : '');
        
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        div.innerHTML = `<span class="nickname">${escapeHtml(data.nickname)} <span class="time">${time}</span></span><span class="text">${escapeHtml(data.text)}</span>`;
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
    
    addUnifiedMessage(team, data);
}

function addUnifiedMessage(team, data) {
    const container = document.getElementById('unified-chat');
    if (!container) return;
    
    const div = document.createElement('div');
    const isMyMessage = data.nickname && data.nickname.startsWith(userName);
    const teamSide = team === myTeam ? 'mine' : 'theirs';
    div.className = `chat-bubble ${teamSide} ${data.isWarning ? 'warning' : ''}`;
    
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Determine team color based on nickname
    let teamColor = '#ffffff';
    if (data.nickname) {
        if (data.nickname.includes('RCB')) teamColor = '#ff0000';
        else if (data.nickname.includes('SRH')) teamColor = '#ff6600';
        else if (data.nickname.includes('CSK')) teamColor = '#FECE00';
        else if (data.nickname.includes('MI')) teamColor = '#004BA0';
        else if (data.nickname.includes('KKR')) teamColor = '#4a0080';
        else if (data.nickname.includes('DC')) teamColor = '#dd1e25';
        else if (data.nickname.includes('LSG')) teamColor = '#00a86b';
        else if (data.nickname.includes('GT')) teamColor = '#d4af37';
        else if (data.nickname.includes('RR')) teamColor = '#e91e63';
        else if (data.nickname.includes('PBKS')) teamColor = '#ed1c24';
    }
    
    const displayName = data.nickname || 'Anonymous';
    
    div.innerHTML = `
        <div class="bubble-header">
            <span class="bubble-nickname" style="color: ${teamColor}; text-shadow: 0 0 8px ${teamColor};">${escapeHtml(displayName)}</span>
            <span class="bubble-time">${time}</span>
        </div>
        <div class="bubble-text">${escapeHtml(data.text)}</div>
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function logout() {
    if (confirm('Are you sure you want to leave the battle?')) {
        localStorage.removeItem('warSession');
        localStorage.removeItem('warSessionExpiry');
        localStorage.removeItem('warnings');
        window.location.reload();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleShout(team) {
    globalShouts[team]++;
    recentShouts[team].push(Date.now());
    updateGlobalCounter();
    updatePowerMeter();
    document.getElementById(`${team}-local-count`).innerText = globalShouts[team];
}

function updateGlobalCounter() {}

function updatePowerMeter() {
    const now = Date.now();
    
    recentShouts.team1 = recentShouts.team1.filter(t => now - t < RECENT_SHOUTS_WINDOW_MS);
    recentShouts.team2 = recentShouts.team2.filter(t => now - t < RECENT_SHOUTS_WINDOW_MS);
    
    if (recentShouts.team1.length > MAX_RECENT_SHOUTS) {
        recentShouts.team1 = recentShouts.team1.slice(-MAX_RECENT_SHOUTS);
    }
    if (recentShouts.team2.length > MAX_RECENT_SHOUTS) {
        recentShouts.team2 = recentShouts.team2.slice(-MAX_RECENT_SHOUTS);
    }
    
    const t1Power = recentShouts.team1.length;
    const t2Power = recentShouts.team2.length;
    const total = t1Power + t2Power;
    
    const t1Percent = total === 0 ? 50 : (t1Power / total) * 100;
    const t2Percent = total === 0 ? 50 : (t2Power / total) * 100;
    
    document.getElementById('rcb-power').style.width = t1Percent + '%';
    document.getElementById('srh-power').style.width = t2Percent + '%';
    
    const side1 = document.getElementById('team1-side');
    const side2 = document.getElementById('team2-side');
    
    if (t1Power > t2Power) { side1.classList.add('louder'); side2.classList.remove('louder'); }
    else if (t2Power > t1Power) { side2.classList.add('louder'); side1.classList.remove('louder'); }
    
    updateIntensityWidget();
}

function sendMessage(team) {
    if (!ably) {
        showToast('Connecting to server, please wait...', 'warning');
        return;
    }
    if (ably.connection.state !== 'connected') {
        showToast('Still connecting, please wait...', 'warning');
        return;
    }
    if (team !== myTeam) { showToast('You can only shout for your team!', 'error'); return; }
    if (Date.now() < blockedUntil) { showToast('You are blocked. Please wait.', 'error'); return; }
    
    const input = document.getElementById('unified-input');
    let message = input.value.trim();
    if (!message) return;
    
    if (message.length > 200) {
        message = message.substring(0, 200);
    }
    
    if (profanityList.test(message)) {
        warnings++;
        localStorage.setItem('warnings', warnings);
        
        if (warnings >= 2) {
            blockedUntil = Date.now() + 300000;
            showToast('Blocked for 5 minutes. Keep it clean!', 'error');
            input.value = '';
            return;
        }
        
        showToast(`Warning ${warnings}/2: Keep it clean!`, 'warning');
        
        const shortName = window.myTeamShort || (team === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2'));
        ably.channels.get(`${team}-war-room`).publish('message', { nickname: `${userName} ${shortName}`, text: '⚠️ Keep it clean!', isWarning: true });
        input.value = '';
        return;
    }
    
    const shortName = window.myTeamShort || (team === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2'));
    ably.channels.get(`${team}-war-room`).publish('message', { nickname: `${userName} ${shortName}`, text: message });
    ably.channels.get(`${team}-war-room`).publish('shout', { timestamp: Date.now() });
    
    input.value = '';
    
    const btn = document.querySelector(`.shout-btn`);
    if (btn) {
        btn.classList.add('louder');
        setTimeout(() => btn.classList.remove('louder'), 500);
    }
    
    const picker = document.getElementById('unified-emoji-picker');
    if (picker) picker.classList.add('d-none');
    
    myShoutCount++;
    updateWarriorCount(userName, myShoutCount);
}

function sendUnifiedMessage() {
    if (!myTeam) {
        showToast('Please join a team first!', 'warning');
        return;
    }
    sendMessage(myTeam);
}

function updateWarriorCount(name, count) {
    const clientId = ably?.clientId || userName || 'anonymous';
    const displayName = window.myTeamShort ? `${name} ${window.myTeamShort}` : name;
    userShouts[clientId] = { count: count, displayName: displayName };
    
    if (ably && ably.connection.state === 'connected') {
        ably.channels.get('warrior-stats').publish('shout-update', {
            clientId: clientId,
            name: name,
            displayName: displayName,
            count: count,
            team: myTeam
        });
    }
    
    updateTopWarriors();
}

function subscribeToWarriorStats() {
    const statsChannel = ably.channels.get('warrior-stats');
    statsChannel.subscribe('shout-update', (msg) => {
        userShouts[msg.data.clientId] = { count: msg.data.count, displayName: msg.data.displayName };
        updateTopWarriors();
    });
}

function updateTopWarriors() {
    const container = document.getElementById('top-warriors');
    if (!container) return;
    
    const sorted = Object.entries(userShouts)
        .sort((a, b) => (b[1]?.count || 0) - (a[1]?.count || 0))
        .slice(0, 5);
    
    if (sorted.length === 0) {
        container.innerHTML = '<span class="no-warriors">Be the first to shout!</span>';
        return;
    }
    
    container.innerHTML = sorted.map(([clientId, data], idx) => {
        const rank = idx + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank + '.';
        const displayName = data?.displayName || clientId;
        const count = data?.count || 0;
        
        let nameColor = '#ffffff';
        if (displayName.includes('RCB')) nameColor = '#ff0000';
        else if (displayName.includes('SRH')) nameColor = '#ff6600';
        else if (displayName.includes('CSK')) nameColor = '#FECE00';
        else if (displayName.includes('MI')) nameColor = '#004BA0';
        
        return `<span class="warrior-item">${medal} <span style="color: ${nameColor}; font-weight: 700;">${escapeHtml(displayName)}</span> (${count})</span>`;
    }).join('');
}

function updateIntensityWidget() {
    const now = Date.now();
    const t1Recent = recentShouts.team1.filter(t => now - t < RECENT_SHOUTS_WINDOW_MS).length;
    const t2Recent = recentShouts.team2.filter(t => now - t < RECENT_SHOUTS_WINDOW_MS).length;
    const total = t1Recent + t2Recent;
    
    const t1Pct = total === 0 ? 50 : Math.round((t1Recent / total) * 100);
    const t2Pct = total === 0 ? 50 : Math.round((t2Recent / total) * 100);
    
    const t1Bar = document.getElementById('intensity-team1');
    const t2Bar = document.getElementById('intensity-team2');
    const t1Label = document.getElementById('intensity-team1-label');
    const t2Label = document.getElementById('intensity-team2-label');
    
    if (t1Bar) t1Bar.style.width = t1Pct + '%';
    if (t2Bar) t2Bar.style.width = t2Pct + '%';
    
    const t1 = matchConfig?.team1?.short || 'Team1';
    const t2 = matchConfig?.team2?.short || 'Team2';
    if (t1Label) t1Label.innerText = t1 + ' ' + t1Pct + '%';
    if (t2Label) t2Label.innerText = t2Pct + '% ' + t2;
}

function sendSledge(team, text) {
    if (!ably || ably.connection.state !== 'connected') {
        showToast('Connecting to server, please wait...', 'warning');
        return;
    }
    if (team !== myTeam) { showToast('You can only sledge for your team!', 'error'); return; }
    if (Date.now() < blockedUntil) { showToast('You are blocked. Please wait.', 'error'); return; }
    
    const shortName = window.myTeamShort || (team === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2'));
    ably.channels.get(`${team}-war-room`).publish('message', { nickname: `${userName} ${shortName}`, text: text });
    ably.channels.get(`${team}-war-room`).publish('shout', { timestamp: Date.now() });
    
    const btn = document.querySelector(`#${team}-side .shout-btn`);
    btn.classList.add('louder');
    setTimeout(() => btn.classList.remove('louder'), 500);
}

function toggleEmojiPicker(team) {
    if (team === 'unified') {
        const picker = document.getElementById('unified-emoji-picker');
        if (picker) picker.classList.toggle('d-none');
    } else {
        const picker = document.getElementById(`${team}-emoji-picker`);
        if (picker) picker.classList.toggle('d-none');
    }
}

function insertEmoji(team, emoji) {
    if (team === 'unified') {
        const input = document.getElementById('unified-input');
        input.value += emoji;
        input.focus();
        const picker = document.getElementById('unified-emoji-picker');
        if (picker) picker.classList.add('d-none');
    } else {
        const input = document.getElementById(`${team}-input`);
        input.value += emoji;
        input.focus();
        const picker = document.getElementById(`${team}-emoji-picker`);
        if (picker) picker.classList.add('d-none');
    }
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'i'}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (!widget) return;
    widget.classList.toggle('collapsed');
}

function generateUnifiedSledgeBar() {
    const track = document.getElementById('sledge-track');
    if (!track) return;
    
    const t1 = matchConfig?.team1?.short || 'RCB';
    const t2 = matchConfig?.team2?.short || 'SRH';
    const sledges1 = getSledgesForTeam(t1);
    const sledges2 = getSledgesForTeam(t2);
    const allSledges = [...sledges1, ...sledges2].slice(0, 10);
    
    track.innerHTML = allSledges.map(s => 
        `<button class="sledge-chip" onclick="sendUnifiedSledge('${escapeHtml(s)}')">${escapeHtml(s)}</button>`
    ).join('');
}

function sendUnifiedSledge(text) {
    if (!myTeam) {
        showToast('Please join a team first!', 'warning');
        return;
    }
    sendSledge(myTeam, text);
}

const cricketActions = {
    'SIX': { emoji: '🏏', text: 'SIX! BOOM!' },
    'FOUR': { emoji: '💥', text: 'FOUR! Boundary!' },
    'WICKET': { emoji: '❌', text: 'WICKET! Big moment!' },
    'YORKER': { emoji: '🎯', text: 'YORKER! Perfect delivery!' },
    'CATCH': { emoji: '🙌', text: 'CATCH! Spectacular!' }
};

function sendCricketAction(action) {
    if (!myTeam) {
        showToast('Please join a team first!', 'warning');
        return;
    }
    if (!cricketActions[action]) return;
    
    const actionData = cricketActions[action];
    const shortName = window.myTeamShort || (myTeam === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2'));
    
    if (ably && ably.connection.state === 'connected') {
        ably.channels.get(`${myTeam}-war-room`).publish('message', { 
            nickname: `${userName} ${shortName}`, 
            text: `${actionData.emoji} ${actionData.text}` 
        });
        ably.channels.get(`${myTeam}-war-room`).publish('shout', { timestamp: Date.now() });
        
        myShoutCount++;
        updateWarriorCount(userName, myShoutCount);
        
        triggerEvent(action);
    }
}

function joinWar() {
    const firstName = document.getElementById('firstName').value.trim();
    const teamSelect = document.getElementById('teamSelect').value;
    const errorDiv = document.getElementById('modalError');
    
    if (!firstName) { errorDiv.textContent = 'Enter your name!'; errorDiv.classList.remove('d-none'); return; }
    if (firstName.length < 2) { errorDiv.textContent = 'Name must be at least 2 characters!'; errorDiv.classList.remove('d-none'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(firstName)) { errorDiv.textContent = 'Only letters, numbers, and underscores allowed!'; errorDiv.classList.remove('d-none'); return; }
    if (!teamSelect) { errorDiv.textContent = 'Select your team!'; errorDiv.classList.remove('d-none'); return; }
    
    // Map selected team to team1 or team2 based on current match
    const teamMap = {
        'team1': 'team1',  // RCB
        'team2': 'team2',  // SRH
        'team3': 'team1',  // CSK
        'team4': 'team2',  // MI
        'team5': 'team1',  // KKR
        'team6': 'team2',  // DC
        'team7': 'team1',  // LSG
        'team8': 'team2',  // GT
        'team9': 'team1',  // RR
        'team10': 'team2' // PBKS
    };
    
    userName = firstName;
    myTeam = teamMap[teamSelect] || 'team1';
    
    const teamShortCode = teamSelect === 'team1' ? 'RCB' : 
                          teamSelect === 'team2' ? 'SRH' :
                          teamSelect === 'team3' ? 'CSK' :
                          teamSelect === 'team4' ? 'MI' :
                          teamSelect === 'team5' ? 'KKR' :
                          teamSelect === 'team6' ? 'DC' :
                          teamSelect === 'team7' ? 'LSG' :
                          teamSelect === 'team8' ? 'GT' :
                          teamSelect === 'team9' ? 'RR' : 'PBKS';
    
    window.myTeamShort = teamShortCode;
    
    const sessionData = {
        firstName: firstName,
        teamCode: teamSelect,
        myTeam: myTeam,
        teamShort: teamShortCode,
        timestamp: Date.now()
    };
    localStorage.setItem('warSession', JSON.stringify(sessionData));
    localStorage.setItem('warSessionExpiry', Date.now() + 5 * 60 * 60 * 1000);
    
    warnings = parseInt(localStorage.getItem('warnings') || '0');
    
    errorDiv.classList.add('d-none');
    
    // Hide the modal
    const modalEl = document.getElementById('nicknameModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    } else {
        modalEl.style.display = 'none';
        modalEl.classList.remove('show');
    }
    
    checkForAdmin();
    initAbly();
}

function checkForAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        const adminPassModal = document.getElementById('adminPasswordModal');
        if (adminPassModal && window.bootstrap?.Modal) {
            new bootstrap.Modal(adminPassModal).show();
        }
    }
}

function verifyAdmin() {
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminError');
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        errorDiv.classList.add('d-none');
        bootstrap.Modal.getInstance(document.getElementById('adminPasswordModal')).hide();
        bootstrap.Modal.getInstance(document.getElementById('adminModal')).show();
        setupAdminChannel();
        populateMatchSelect();
    } else {
        errorDiv.textContent = 'Wrong password!';
        errorDiv.classList.remove('d-none');
    }
}

function setupAdminChannel() {
    window.adminChannel = ably.channels.get('match-config');
}

function populateMatchSelect() {
    const select = document.getElementById('match-select');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = iplSchedule.filter(m => new Date(m.date) >= today).slice(0, 10);
    
    select.innerHTML = '<option value="">-- Select Match --</option>' + 
        upcoming.map(m => `<option value="${m.match}|${m.team1}|${m.team1Full}|${m.team2}|${m.team2Full}|${m.date}|${m.time}|${m.venue}">${m.match}: ${m.team1} vs ${m.team2}</option>`).join('');
}

function loadMatchDetails() {
    const select = document.getElementById('match-select');
    const val = select.value;
    if (!val) return;
    
    const parts = val.split('|');
    document.getElementById('admin-match-number').value = parts[0];
    document.getElementById('admin-team1-short').value = parts[1];
    document.getElementById('admin-team1-full').value = parts[2];
    document.getElementById('admin-team2-short').value = parts[3];
    document.getElementById('admin-team2-full').value = parts[4];
    document.getElementById('admin-match-time').value = parts[5] + 'T' + parts[6];
    document.getElementById('admin-venue').value = parts[7];
}

function syncNextMatch() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextMatch = iplSchedule.find(m => new Date(m.date) >= today);
    if (!nextMatch) { showToast('No upcoming matches!', 'warning'); return; }
    
    matchConfig = {
        team1: { short: nextMatch.team1, full: nextMatch.team1Full },
        team2: { short: nextMatch.team2, full: nextMatch.team2Full },
        matchTime: `${nextMatch.date}T${nextMatch.time}:00+05:30`,
        venue: nextMatch.venue,
        matchNumber: nextMatch.match
    };
    
    if (window.adminChannel) {
        window.adminChannel.publish('config-update', matchConfig);
    }
    
    applyMatchConfig();
    startCountdown();
    showToast('Next match synced!', 'success');
}

function activateCountdown() {
    if (!isAdmin || !window.adminChannel) { showToast('Admin only!', 'error'); return; }
    startCountdown();
    showToast('Countdown started!', 'success');
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    let pollStarted = false;
    
    countdownInterval = setInterval(() => {
        let matchTime = matchConfig?.matchTime || document.getElementById('admin-match-time')?.value;
        
        if (!matchTime) {
            matchTime = '2026-03-28T19:30:00+05:30';
        }
        
        const target = new Date(matchTime).getTime();
        const now = Date.now();
        const diff = target - now;
        
        if (diff <= 0) {
            const countdownEl = document.getElementById('countdown-time');
            if (countdownEl) countdownEl.innerText = 'LIVE NOW!';
            
            // Trigger poll when match starts
            if (!pollStarted) {
                pollStarted = true;
                console.log('Match started! Triggering poll...');
                triggerRandomPoll();
                
                // Set interval for new poll every 15 minutes
                if (pollTimerId) clearInterval(pollTimerId);
                pollTimerId = setInterval(() => {
                    triggerRandomPoll();
                }, 900000);
            }
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        let timeStr = '';
        if (days > 0) timeStr += days + 'd ';
        timeStr += String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        
        const countdownEl = document.getElementById('countdown-time');
        if (!countdownEl) return;
        countdownEl.innerText = timeStr;
        
        if (diff < 3600000) countdownEl.classList.add('very-urgent');
        else if (diff < 14400000) countdownEl.classList.add('urgent');
        else countdownEl.classList.remove('urgent', 'very-urgent');
        
    }, 1000);
}

function triggerEvent(type) {
    if (!isAdmin) return;
    
    const overlay = document.getElementById('event-overlay');
    const fireworks = document.getElementById('fireworks');
    const eventEmoji = document.getElementById('event-emoji');
    
    overlay.classList.add('active');
    
    if (type === 'SIX' || type === 'FOUR') {
        fireworks.style.display = 'block';
        eventEmoji.innerHTML = type === 'SIX' ? '🎆' : '💥';
        eventEmoji.style.color = type === 'SIX' ? '#FFD700' : '#00FFFF';
        eventEmoji.className = 'event-emoji';
    } else if (type === 'WICKET') {
        fireworks.style.display = 'none';
        eventEmoji.innerHTML = '💀';
        eventEmoji.className = 'event-emoji silence';
        
        const oppositeTeam = myTeam === 'team1' ? 'team2' : 'team1';
        const side = document.getElementById(`${oppositeTeam}-side`);
        side.style.opacity = '0.3';
        setTimeout(() => { side.style.opacity = '1'; }, 5000);
    } else if (type === 'WIN') {
        eventEmoji.innerHTML = '🏆';
        eventEmoji.className = 'event-emoji';
    }
    
    setTimeout(() => {
        overlay.classList.remove('active');
        fireworks.style.display = 'none';
        eventEmoji.innerHTML = '';
    }, 3000);
}

function switchTheme(theme) {
    document.body.className = '';
    if (theme !== 'default') document.body.classList.add('theme-' + theme);
}

function handleKeyboardShortcuts(e) {
    if (!isAdmin) return;
    if (e.key === 'F1') { e.preventDefault(); triggerEvent('SIX'); }
    else if (e.key === 'F2') { e.preventDefault(); triggerEvent('FOUR'); }
    else if (e.key === 'F3') { e.preventDefault(); triggerEvent('WICKET'); }
    else if (e.key === 'F4') { e.preventDefault(); triggerEvent('WIN'); }
}

document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus('connecting');
    
    const savedSession = localStorage.getItem('warSession');
    const sessionExpiry = localStorage.getItem('warSessionExpiry');
    let sessionRestored = false;
    
    if (savedSession && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
        try {
            const sessionData = JSON.parse(savedSession);
            userName = sessionData.firstName;
            myTeam = sessionData.myTeam;
            window.myTeamShort = sessionData.teamShort;
            sessionRestored = true;
            console.log('Session restored:', userName, sessionData.teamShort);
        } catch (e) {
            console.log('Failed to restore session');
        }
    }
    
    const firstMatch = iplSchedule[0];
    const matchTimeIST = `${firstMatch.date}T${firstMatch.time}:00+05:30`;
    
    matchConfig = {
        team1: { short: firstMatch.team1, full: firstMatch.team1Full },
        team2: { short: firstMatch.team2, full: firstMatch.team2Full },
        matchTime: matchTimeIST,
        venue: firstMatch.venue,
        matchNumber: firstMatch.match
    };
    
    document.getElementById('team1-name').innerText = firstMatch.team1;
    document.getElementById('team2-name').innerText = firstMatch.team2;
    document.getElementById('intensity-team1-label').innerText = firstMatch.team1;
    document.getElementById('intensity-team2-label').innerText = firstMatch.team2;
    document.getElementById('match-number').innerText = firstMatch.match;
    document.getElementById('venue-display').innerText = firstMatch.venue;
    document.getElementById('poll-btn-team1').innerText = firstMatch.team1;
    document.getElementById('poll-btn-team2').innerText = firstMatch.team2;
    
    if (firstMatch.team1 && teamColors[firstMatch.team1]) {
        document.documentElement.style.setProperty('--team1-primary', teamColors[firstMatch.team1].primary);
        document.documentElement.style.setProperty('--team1-secondary', teamColors[firstMatch.team1].secondary);
    }
    if (firstMatch.team2 && teamColors[firstMatch.team2]) {
        document.documentElement.style.setProperty('--team2-primary', teamColors[firstMatch.team2].primary);
        document.documentElement.style.setProperty('--team2-secondary', teamColors[firstMatch.team2].secondary);
    }
    
    generateSledgeBar('team1', getSledgesForTeam(firstMatch.team1));
    generateSledgeBar('team2', getSledgesForTeam(firstMatch.team2));
    generateUnifiedSledgeBar();
    setupEmojiPicker('team1');
    setupEmojiPicker('team2');
    setupEmojiPicker('unified');
    
    startCountdown();
    
    setInterval(updateIntensityWidget, 2000);
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Modal bootstrap might fail to load (offline/CDN), so guard to avoid killing initialization.
    if (urlParams.get('admin') === 'true') {
        const adminPassModal = document.getElementById('adminPasswordModal');
        if (window.bootstrap?.Modal && adminPassModal) new bootstrap.Modal(adminPassModal).show();
    } else if (sessionRestored) {
        checkForAdmin();
        initAbly();
    } else {
        const nicknameModal = document.getElementById('nicknameModal');
        if (window.bootstrap?.Modal && nicknameModal) new bootstrap.Modal(nicknameModal).show();
    }
    
    const teamSelectEl = document.getElementById('teamSelect');
    const modalErrorEl = document.getElementById('modalError');
    if (teamSelectEl && modalErrorEl) {
        teamSelectEl.addEventListener('change', function() {
            modalErrorEl.classList.add('d-none');
        });
    }
    
    const firstNameEl = document.getElementById('firstName');
    if (firstNameEl) {
        firstNameEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') joinWar();
        });
    }
    
    const adminPasswordEl = document.getElementById('adminPassword');
    if (adminPasswordEl) {
        adminPasswordEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') verifyAdmin();
        });
    }
    
    const team1InputEl = document.getElementById('team1-input');
    if (team1InputEl) {
        team1InputEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); sendMessage('team1'); }
        });
    }
    
    const team2InputEl = document.getElementById('team2-input');
    if (team2InputEl) {
        team2InputEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); sendMessage('team2'); }
        });
    }
    
    const unifiedInputEl = document.getElementById('unified-input');
    if (unifiedInputEl) {
        unifiedInputEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); sendUnifiedMessage(); }
        });
    }
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
            document.querySelectorAll('.emoji-picker').forEach(p => p.classList.add('d-none'));
        }
    });
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    if (typeof updatePowerMeter === 'function') setInterval(updatePowerMeter, 1000);
});
