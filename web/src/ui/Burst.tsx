import { Lottie } from '../lottie/Lottie';
import type { Anim } from '../lottie/build';

/** A short celebration over the screen: the app's success animation and one line. Ignores touches. */
export function Burst({ art, line }: { art: Anim; line: string }) {
  return (
    <div className="u-burst" role="status" aria-live="polite">
      <Lottie data={art} loop={false} className="u-burst-art" label="Done" still={0.7} />
      {line && <b>{line}</b>}
    </div>
  );
}
