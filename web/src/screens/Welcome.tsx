import { useMemo } from 'react';
import { APP } from '../app-info';
import { Mark } from '../ui/icons';
import { useApp } from '../ui/kit';
import { Tour } from '../ui/Tour';
import { PALETTES, tourOrb, tourPattern, tourRipples } from '../lottie/scenes';

/** First launch: three slow cards under the night sky. */
export default function Welcome({ onDone }: { onDone: () => void }) {
  const { settings, tap } = useApp();
  const p = PALETTES[settings.theme];
  const slides = useMemo(() => [
    { kicker: 'Breathe', title: 'Follow the orb', body: 'It swells as you breathe in and settles as you breathe out. Close your eyes and follow the gentle taps.', label: 'A glowing orb swells and settles with a slow breath', art: tourOrb(p) },
    { kicker: 'Patterns', title: 'A rhythm for every moment', body: 'Box breathing, 4-7-8, coherent breathing and more, or set your own counts.', label: 'A point of light travels the four sides of a box', art: tourPattern(p) },
    { kicker: 'Sounds and journal', title: 'Soft sounds, a gentle log', body: 'Rain, waves or a soft drone if you like, and a journal of every session with your streak.', label: 'Slow ripples spread out from a small orb', art: tourRipples(p) },
  ], [p]);
  return <Tour name={APP.name} mark={<Mark size={30} />} slides={slides} cta="Take a breath" variant="circle dots-ring" onTap={() => tap()} onDone={onDone} />;
}
