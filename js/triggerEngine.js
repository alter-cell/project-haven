let taps = 0;
let resetTimer;

export function resetTrigger() {
  taps = 0;
  clearTimeout(resetTimer);
}

export function checkTrigger(position, configuration, onTriggered) {
  const trigger = configuration?.secret?.trigger;
  if (!configuration?.secret?.enabled || !trigger) return;
  const samePosition = ["bookId", "chapterId", "pageId", "paragraphIndex", "wordIndex"]
    .every((key) => String(position[key]) === String(trigger[key]));
  if (!samePosition) {
    resetTrigger();
    return;
  }
  taps += 1;
  clearTimeout(resetTimer);
  resetTimer = setTimeout(resetTrigger, 1600);
  if (taps === trigger.tapCount) {
    resetTrigger();
    onTriggered();
  }
}
