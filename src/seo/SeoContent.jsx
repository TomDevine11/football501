import { Link } from 'react-router-dom'
import { routeByPath, indexableRoutes } from './seoConfig'

// Visible, crawlable on-page content for a game route: the page's single <h1>,
// a "How to play" section and an FAQ (which also powers the FAQ structured
// data), plus internal links to the other games. Rendered live in the app
// (Google indexes the rendered DOM) and mirrored by the prerender for crawlers.
export default function SeoContent({ path }) {
  const r = routeByPath(path)
  const others = indexableRoutes().filter(o => o.path !== path && o.path !== '/')

  return (
    <section className="w-full max-w-lg mx-auto mt-12 mb-4 text-left border-t border-gray-800/60 pt-8">
      <h1 className="text-2xl font-bold text-white mb-1">{r.h1}</h1>
      <p className="text-gray-400 text-sm mb-3">{r.tagline}</p>
      {r.about && <p className="text-gray-500 text-sm leading-relaxed mb-6">{r.about}</p>}

      {r.howTo?.length > 0 && (
        <>
          <h2 className="text-white font-semibold text-base mb-2">How to play {r.name}</h2>
          <ol className="list-decimal list-inside space-y-1 text-gray-400 text-sm mb-6">
            {r.howTo.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </>
      )}

      {r.faq?.length > 0 && (
        <>
          <h2 className="text-white font-semibold text-base mb-2">Frequently asked questions</h2>
          <dl className="space-y-3 mb-6">
            {r.faq.map((f, i) => (
              <div key={i}>
                <dt className="text-gray-200 text-sm font-medium">{f.q}</dt>
                <dd className="text-gray-500 text-sm mt-0.5">{f.a}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <nav aria-label="More football trivia games">
        <h2 className="text-white font-semibold text-base mb-2">More football trivia games</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {others.map(o => (
            <li key={o.path}>
              <Link to={o.path} className="text-green-400 hover:text-green-300 transition-colors">{o.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
