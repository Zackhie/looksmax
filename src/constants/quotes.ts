export const DAILY_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "The face you deserve at 40 is the one you build in your 20s.",
  "Small daily improvements are the key to staggering long-term results.",
  "You don't rise to the level of your goals. You fall to the level of your systems.",
  "The only person you should try to be better than is who you were yesterday.",
  "Consistency beats intensity. Show up every single day.",
  "Your appearance is a reflection of your habits. Lock in.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Winners are not people who never fail, but people who never quit.",
  "Hard work beats talent when talent doesn't work hard.",
  "The body achieves what the mind believes.",
  "Every champion was once a contender who refused to give up.",
  "Don't wish for it. Work for it.",
  "If it doesn't challenge you, it doesn't change you.",
  "Become the person who attracts the results you want.",
  "Comfort is the enemy of progress.",
  "The grind includes Friday night, Saturday morning, and Sunday too.",
  "Nobody cares. Work harder.",
  "You're one decision away from a completely different life.",
  "The pain of discipline weighs ounces. The pain of regret weighs tons.",
  "Stop waiting for motivation. Cultivate discipline.",
  "Your daily routine determines your future self.",
  "The best time to start was yesterday. The next best time is now.",
  "What you do every day matters more than what you do once in a while.",
  "Invest in yourself. It pays the best interest.",
  "The mirror doesn't lie. Neither does consistency.",
  "Be so good they can't ignore you.",
  "Results happen over time, not overnight. Stay locked in.",
  "Average is a failing formula. Push past it.",
  "Your face, your body, your life — you're the architect.",
];

export function getDailyQuote(): string {
  // Use day-of-year to cycle through quotes so it changes daily
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
