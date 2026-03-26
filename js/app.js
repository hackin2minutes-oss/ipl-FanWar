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

const emojis = ['🔥', '🏏', '💪', '🎉', '👏', '🙌', '⚡', '🌟', '😤', '😂', '😎', '🤩', '🎯', '🏆', '💯', '🚀', '❤️', '✌️'];

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

async function initAbly() {
    try {
        // Create Ably client with clientId
        ably = new Ably.Realtime({
            key: ABLY_API_KEY,
            clientId: userName || 'anonymous'
        });
        
        ably.connection.on('connected', () => {
            console.log('Connected to Ably!');
            setupPresence();
            subscribeToMatchConfig();
            subscribeToChannels();
            subscribeToPolls();
            
            if (isAdmin) {
                setupAdminChannel();
                populateMatchSelect();
            }
            
            startPollTimer();
        });
        
        ably.connection.on('failed', (err) => {
            console.error('Ably connection failed:', err);
        });
        
    } catch (error) {
        console.error('Failed to connect to Ably:', error);
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
    const picker = document.getElementById(`${team}-emoji-picker`);
    picker.innerHTML = emojis.map(e => `<span class="emoji" onclick="insertEmoji('${team}', '${e}')">${e}</span>`).join('');
}

function generateSledgeBar(team, sledges) {
    const track = document.getElementById(`${team}-sledges`);
    track.innerHTML = sledges.map(s => `<button class="sledge-chip" onclick="sendSledge('${team}', '${s}')">${s}</button>`).join('');
}

function subscribeToChannels() {
    const team1Channel = ably.channels.get('team1-war-room');
    const team2Channel = ably.channels.get('team2-war-room');

    team1Channel.subscribe('message', (msg) => addMessage('team1', msg.data));
    team2Channel.subscribe('message', (msg) => addMessage('team2', msg.data));
    team1Channel.subscribe('shout', () => handleShout('team1'));
    team2Channel.subscribe('shout', () => handleShout('team2'));
}

function subscribeToPolls() {
    const pollChannel = ably.channels.get('poll-votes');
    pollChannel.subscribe('new-poll', (msg) => showPollModal(msg.data));
    pollChannel.subscribe('vote-update', (msg) => updatePollDisplay(msg.data));
    pollChannel.subscribe('poll-closed', (msg) => savePollResult(msg.data));
}

function startPollTimer() {
    setInterval(() => {
        if (Math.random() > 0.3) {
            triggerRandomPoll();
        }
    }, 300000);
}

function triggerRandomPoll() {
    const scenario = pollScenarios[Math.floor(Math.random() * pollScenarios.length)];
    const t1 = matchConfig?.team1?.short || 'Team 1';
    const t2 = matchConfig?.team2?.short || 'Team 2';
    
    const pollData = {
        question: scenario.q,
        option1: scenario.t1,
        option2: scenario.t2,
        team1Votes: 0,
        team2Votes: 0,
        timestamp: Date.now()
    };
    
    ably.channels.get('poll-votes').publish('new-poll', pollData);
    
    setTimeout(() => {
        closePoll();
    }, 30000);
}

function showPollModal(data) {
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

function closePoll() {
    if (window.currentPollModal) {
        window.currentPollModal.hide();
    }
    
    if (window.currentPoll) {
        savePollResult(window.currentPoll);
        window.currentPoll = null;
    }
}

function savePollResult(data) {
    const result = {
        question: data.question.substring(0, 25) + '...',
        team1: data.option1,
        team2: data.option2,
        team1Pct: data.team1Votes,
        team2Pct: data.team2Votes
    };
    
    pollResults.unshift(result);
    if (pollResults.length > 3) pollResults.pop();
    
    updatePollResultsDisplay();
    
    ably.channels.get('poll-votes').publish('poll-closed', data);
}

function updatePollResultsDisplay() {
    for (let i = 0; i < 3; i++) {
        const el = document.getElementById(`poll-result-${i + 1}`);
        if (pollResults[i]) {
            const total = pollResults[i].team1Pct + pollResults[i].team2Pct;
            const t1Pct = total === 0 ? 50 : Math.round((pollResults[i].team1Pct / total) * 100);
            const t2Pct = total === 0 ? 50 : Math.round((pollResults[i].team2Pct / total) * 100);
            
            el.innerHTML = `
                <span>${pollResults[i].question}</span>
                <span class="result-bar result-team1" style="width:${t1Pct}px"></span>
                <span>${t1Pct}%</span>
                <span>vs</span>
                <span class="result-bar result-team2" style="width:${t2Pct}px"></span>
                <span>${t2Pct}%</span>
            `;
        } else {
            el.innerHTML = '';
        }
    }
}

function addMessage(team, data) {
    const container = document.getElementById(`${team}-chat`);
    const div = document.createElement('div');
    div.className = 'chat-message' + (data.isWarning ? ' warning' : '');
    
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    div.innerHTML = `<span class="nickname">${escapeHtml(data.nickname)} <span class="time">${time}</span></span><span class="text">${escapeHtml(data.text)}</span>`;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
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
    const windowMs = 60000;
    
    recentShouts.team1 = recentShouts.team1.filter(t => now - t < windowMs);
    recentShouts.team2 = recentShouts.team2.filter(t => now - t < windowMs);
    
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
}

function sendMessage(team) {
    if (!ably) {
        console.log('Ably not initialized yet');
        return;
    }
    if (ably.connection.state !== 'connected') {
        console.log('Still connecting to Ably, please wait...');
        return;
    }
    if (team !== myTeam) { alert('You can only shout for your team!'); return; }
    if (Date.now() < blockedUntil) { alert('You are blocked. Please wait.'); return; }
    
    const input = document.getElementById(`${team}-input`);
    let message = input.value.trim();
    if (!message) return;
    
    if (profanityList.test(message)) {
        warnings++;
        localStorage.setItem('warnings', warnings);
        
        if (warnings >= 2) {
            blockedUntil = Date.now() + 300000;
            alert('Blocked for 5 minutes.');
            input.value = '';
            return;
        }
        
        alert(`Warning ${warnings}/2: Keep it clean!`);
        
        const shortName = team === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2');
        ably.channels.get(`${team}-war-room`).publish('message', { nickname: `${userName} ${shortName}`, text: '⚠️ Keep it clean!', isWarning: true });
        input.value = '';
        return;
    }
    
    const shortName = team === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2');
    ably.channels.get(`${team}-war-room`).publish('message', { nickname: `${userName} ${shortName}`, text: message });
    ably.channels.get(`${team}-war-room`).publish('shout', { timestamp: Date.now() });
    
    input.value = '';
    
    const btn = document.querySelector(`#${team}-side .shout-btn`);
    btn.classList.add('louder');
    setTimeout(() => btn.classList.remove('louder'), 500);
    
    const picker = document.getElementById(`${team}-emoji-picker`);
    if (picker) picker.classList.add('d-none');
}

function sendSledge(team, text) {
    if (team !== myTeam) { alert('You can only sledge for your team!'); return; }
    if (Date.now() < blockedUntil) { alert('You are blocked. Please wait.'); return; }
    
    const shortName = team === 'team1' ? (matchConfig?.team1?.short || 'Team1') : (matchConfig?.team2?.short || 'Team2');
    ably.channels.get(`${team}-war-room`).publish('message', { nickname: `${userName} ${shortName}`, text: text });
    ably.channels.get(`${team}-war-room`).publish('shout', { timestamp: Date.now() });
    
    const btn = document.querySelector(`#${team}-side .shout-btn`);
    btn.classList.add('louder');
    setTimeout(() => btn.classList.remove('louder'), 500);
}

function toggleEmojiPicker(team) {
    const picker = document.getElementById(`${team}-emoji-picker`);
    if (picker) picker.classList.toggle('d-none');
}

function insertEmoji(team, emoji) {
    const input = document.getElementById(`${team}-input`);
    input.value += emoji;
    input.focus();
    const picker = document.getElementById(`${team}-emoji-picker`);
    if (picker) picker.classList.add('d-none');
}

function joinWar() {
    const firstName = document.getElementById('firstName').value.trim();
    const teamSelect = document.getElementById('teamSelect').value;
    const errorDiv = document.getElementById('modalError');
    
    console.log('joinWar called, teamSelect:', teamSelect);
    
    if (!firstName) { errorDiv.textContent = 'Enter your name!'; errorDiv.classList.remove('d-none'); return; }
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
    
    console.log('myTeam set to:', myTeam);
    
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
    
    console.log('Modal hidden, initializing Ably...');
    checkForAdmin();
    initAbly();
}

function checkForAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        bootstrap.Modal.getInstance(document.getElementById('adminPasswordModal')).show();
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
    if (!nextMatch) { alert('No upcoming matches!'); return; }
    
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
    alert('Next match synced!');
}

function activateCountdown() {
    if (!isAdmin || !window.adminChannel) { alert('Admin only!'); return; }
    startCountdown();
    alert('Countdown started!');
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        let matchTime = matchConfig?.matchTime || document.getElementById('admin-match-time')?.value;
        
        if (!matchTime) {
            matchTime = '2026-03-28T19:30:00+05:30';
        }
        
        const target = new Date(matchTime).getTime();
        const now = Date.now();
        const diff = target - now;
        
        if (diff <= 0) {
            document.getElementById('countdown-time').innerText = 'LIVE NOW!';
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
    // Start countdown immediately on page load (even before user joins, no Ably needed)
    const firstMatch = iplSchedule[0];
    const matchTimeIST = `${firstMatch.date}T${firstMatch.time}:00+05:30`;
    
    matchConfig = {
        team1: { short: firstMatch.team1, full: firstMatch.team1Full },
        team2: { short: firstMatch.team2, full: firstMatch.team2Full },
        matchTime: matchTimeIST,
        venue: firstMatch.venue,
        matchNumber: firstMatch.match
    };
    
    document.getElementById('team1-fullname').innerText = firstMatch.team1Full;
    document.getElementById('team2-fullname').innerText = firstMatch.team2Full;
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
    setupEmojiPicker('team1');
    setupEmojiPicker('team2');
    
    startCountdown();
    
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('admin') === 'true') {
        const adminPassModal = document.getElementById('adminPasswordModal');
        new bootstrap.Modal(adminPassModal).show();
    } else {
        const nicknameModal = document.getElementById('nicknameModal');
        new bootstrap.Modal(nicknameModal).show();
    }
    
    document.getElementById('teamSelect').addEventListener('change', function() {
        document.getElementById('modalError').classList.add('d-none');
    });
    
    document.getElementById('firstName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') joinWar();
    });
    
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') verifyAdmin();
    });
    
    document.getElementById('team1-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); sendMessage('team1'); }
    });
    
    document.getElementById('team2-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); sendMessage('team2'); }
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
            document.querySelectorAll('.emoji-picker').forEach(p => p.classList.add('d-none'));
        }
    });
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    setInterval(updatePowerMeter, 1000);
});
