type SportKey =
  | 'boxing'
  | 'judo'
  | 'swimming'
  | 'trackField'
  | 'wrestling'
  | 'winterSports'

import boxerImage from '../../../assets/boxer-cinematic.jpg'
import judoImage from '../../../assets/judo-ippon-seoi-nage.jpg'
import wrestlingImage from '../../../assets/wrestling-suplex.jpg'

type SportSelectionProps = {
  onSelect: (sport: SportKey) => void
}

const SPORTS: { key: SportKey; label: string; image: string }[] = [
  {
    key: 'boxing',
    label: 'Boxing',
    image: boxerImage,
  },
  {
    key: 'judo',
    label: 'Judo',
    image: judoImage,
  },
  {
    key: 'swimming',
    label: 'Swimming',
    image:
      'https://images.pexels.com/photos/260445/pexels-photo-260445.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    key: 'trackField',
    label: 'Track & Field',
    image:
      'https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    key: 'wrestling',
    label: 'Wrestling',
    image: wrestlingImage,
  },
  {
    key: 'winterSports',
    label: 'Winter Sports',
    image:
      'https://images.pexels.com/photos/848618/pexels-photo-848618.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
]

function SportSelection({ onSelect }: SportSelectionProps) {
  return (
    <div className="app-page sport-selection-page bg-white py-10">
      <div className="sport-selection-content">
        <header className="sport-selection-header">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Select sport
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Choose an athlete discipline
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            Pick the sport you want to analyse. We&apos;ll group your video
            uploads and performance metrics by discipline.
          </p>
        </header>
        <div className="sport-selection-grid">
          {SPORTS.map((sport) => (
            <button
              key={sport.key}
              type="button"
              onClick={() => onSelect(sport.key)}
              className="group relative h-32 sm:h-40 rounded-2xl overflow-hidden shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-950"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${sport.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-900/5 group-hover:from-slate-950/90" />
              <div className="relative h-full flex flex-col justify-end px-4 pb-3">
                <span className="text-white text-lg font-semibold drop-shadow">
                  {sport.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { SportKey }
export default SportSelection

