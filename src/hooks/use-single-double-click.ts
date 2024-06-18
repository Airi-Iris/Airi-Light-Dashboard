export function useSingleAndDoubleClick(
  actionSimpleClick: Function,
  actionDoubleClick: Function,
  delay = 250
) {
  const clickCount = ref(0);

  watchEffect(() => {
    const timer = setTimeout(() => {
      // simple click
      if (clickCount.value === 1) actionSimpleClick();
      clickCount.value = 0;
    }, delay);

    // the duration between this click and the previous one
    // is less than the value of delay = double-click
    if (clickCount.value === 2) actionDoubleClick();

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return () => (clickCount.value += 1);
}
