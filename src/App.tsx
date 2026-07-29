import { Navigate, Route, Routes } from 'react-router-dom'
import { getStartRoute, routes } from './routes/registry'

export function App() {
  const startRoute = getStartRoute()

  return (
    <div className="appShell">
      <a className="skipLink" href="#main">
        Skip to content
      </a>
      <main id="main" tabIndex={-1}>
        <Routes>
          {routes.map(({ path, component: Screen, nodeId }) => (
            <Route key={nodeId} path={path} element={<Screen />} />
          ))}
          <Route path="*" element={<Navigate to={startRoute.path} replace />} />
        </Routes>
      </main>
    </div>
  )
}
