const axios = require('axios');

// Fetch LeetCode stats via public GraphQL API
async function fetchLeetCode(username) {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            streak
            totalActiveDays
          }
        }
      }
    `;
    const { data } = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' }, timeout: 10000 }
    );
    const user = data?.data?.matchedUser;
    if (!user) return null;
    const allSolved = user.submitStats?.acSubmissionNum?.find(d => d.difficulty === 'All');
    return {
      streak: user.userCalendar?.streak || 0,
      solvedCount: allSolved?.count || 0
    };
  } catch (e) {
    console.error('LeetCode fetch error:', e.message);
    return null;
  }
}

// Fetch Codeforces stats via public API
async function fetchCodeforces(username) {
  try {
    const { data } = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`,
      { timeout: 10000 }
    );
    if (data.status !== 'OK') return null;

    // Get submissions to count solved
    const subData = await axios.get(
      `https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`,
      { timeout: 15000 }
    );
    let solvedSet = new Set();
    let streak = 0;
    if (subData.data.status === 'OK') {
      const subs = subData.data.result;
      subs.forEach(s => {
        if (s.verdict === 'OK') solvedSet.add(`${s.problem.contestId}-${s.problem.index}`);
      });

      // Calculate streak (days with accepted submissions)
      const daysSolved = new Set();
      subs.forEach(s => {
        if (s.verdict === 'OK') {
          const d = new Date(s.creationTimeSeconds * 1000);
          daysSolved.add(d.toDateString());
        }
      });

      // Simple streak: consecutive days from today
      let currentDate = new Date();
      for (let i = 0; i < 365; i++) {
        if (daysSolved.has(currentDate.toDateString())) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return { streak, solvedCount: solvedSet.size };
  } catch (e) {
    console.error('Codeforces fetch error:', e.message);
    return null;
  }
}

// Fetch GFG stats via unofficial API
async function fetchGFG(username) {
  try {
    const { data } = await axios.get(
      `https://geeks-for-geeks-stats-api.vercel.app/?raw=Y&user=${username}`,
      { timeout: 10000 }
    );
    if (data.status === 'error') return null;

    const solvedCount =
      (data.Easy || 0) + (data.Medium || 0) + (data.Hard || 0);
    return { streak: data.currentStreak || 0, solvedCount };
  } catch (e) {
    console.error('GFG fetch error:', e.message);
    return null;
  }
}

// Fetch HackerRank stats (limited public data)
async function fetchHackerRank(username) {
  try {
    const { data } = await axios.get(
      `https://www.hackerrank.com/rest/hackers/${username}/scores_elo`,
      { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    // HackerRank doesn't expose detailed stats publicly, return basic data
    return { streak: 0, solvedCount: data?.total || 0 };
  } catch (e) {
    console.error('HackerRank fetch error:', e.message);
    return null;
  }
}

// CodeChef stats via unofficial scrape
async function fetchCodeChef(username) {
  try {
    const { data } = await axios.get(
      `https://codechef-api.vercel.app/handle/${username}`,
      { timeout: 10000 }
    );
    if (!data || data.success === false) return null;
    return {
      streak: data.currentRating ? 1 : 0, // CodeChef doesn't expose streak publicly
      solvedCount: data.totalProblems || 0
    };
  } catch (e) {
    console.error('CodeChef fetch error:', e.message);
    return null;
  }
}

// HackerEarth (very limited public API)
async function fetchHackerEarth(username) {
  try {
    const { data } = await axios.get(
      `https://www.hackerearth.com/api/developer/challenges/?username=${username}`,
      { timeout: 10000 }
    );
    return { streak: 0, solvedCount: data?.total || 0 };
  } catch (e) {
    return { streak: 0, solvedCount: 0 };
  }
}

const fetchers = {
  LeetCode: fetchLeetCode,
  CodeChef: fetchCodeChef,
  GeeksforGeeks: fetchGFG,
  Codeforces: fetchCodeforces,
  HackerRank: fetchHackerRank,
  HackerEarth: fetchHackerEarth
};

async function fetchPlatformStats(platformName, username) {
  const fetcher = fetchers[platformName];
  if (!fetcher) return null;
  return fetcher(username);
}

module.exports = { fetchPlatformStats };
