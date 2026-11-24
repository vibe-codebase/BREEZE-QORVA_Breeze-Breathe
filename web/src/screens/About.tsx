import { AboutPage, policy } from '../ui/AboutPage';
import { Mark } from '../ui/icons';
import { useApp } from '../ui/kit';

export default function About() {
  const { tap } = useApp();
  return (
    <div className="page-scroll about-scroll">
      <AboutPage mark={<Mark size={76} />} onTop={() => tap()}
        pills={['No data collected', 'Works offline', 'No ads']}
        what="Paced breathing with a glowing orb: breathing patterns or your own counts, soft background sounds, gentle taps you can feel, and a journal of your sessions with your streak. It is for relaxation and is not medical advice."
        sections={policy('Your session journal, your chosen pattern and sounds, and your settings.', [
          { h: 'Health', p: ['The app does not measure anything about your body. It only times your breathing and notes how long you practised.'] },
        ], 'Vibration only, for a tap at each phase of the breath. You can turn it off in Settings. The screen can stay on during a session, which needs no permission.')} />
    </div>
  );
}
