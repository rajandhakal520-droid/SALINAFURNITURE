// ⏳ Daily Live Countdown Timer (सधैँ चलिरहने)
function startDailyCountdown() {
  const timerBadge = document.querySelector('.countdown-timer-badge');
  if (!timerBadge) return;

  function updateTimer() {
    const now = new Date();
    
    // आज रातीको १२ बजे (Midnight) को समय निकाल्ने
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Next day midnight

    // बाँकी रहेको सेकेन्डहरू निकाल्ने
    let totalSeconds = Math.floor((midnight - now) / 1000);

    if (totalSeconds <= 0) {
      totalSeconds = 12 * 3600; // यदि समय सकियो भने फेरि 12 घण्टाबाट सुरु हुने
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    timerBadge.innerHTML = `⏳ ${formattedHours}h : ${formattedMinutes}m : ${formattedSeconds}s remaining`;
  }

  // सुरुमा एकचोटि चलाउने त्यसपछि हरेक सेकेन्ड अपडेट गर्ने
  updateTimer();
  setInterval(updateTimer, 1000);
}

// Page load भएपछि function कल गर्ने
document.addEventListener('DOMContentLoaded', () => {
  startDailyCountdown();
});