import { BrowserRouter as Router, Routes, Route } from 'react-router'
import SignIn from './pages/AuthPages/SignIn'
import SignUp from './pages/AuthPages/SignUp'
import NotFound from './pages/OtherPage/NotFound'
import UserProfiles from './pages/UserProfiles'
import Videos from './pages/UiElements/Videos'
import Images from './pages/UiElements/Images'
import Alerts from './pages/UiElements/Alerts'
import Badges from './pages/UiElements/Badges'
import Avatars from './pages/UiElements/Avatars'
import Buttons from './pages/UiElements/Buttons'
import LineChart from './pages/Charts/LineChart'
import BarChart from './pages/Charts/BarChart'
import Calendar from './pages/Calendar'
import BasicTables from './pages/Tables/BasicTables'
import BasicTablesOrder from './pages/Tables/BasicTablesOrder'
import BasicTablesProduct from './pages/Tables/BasicTablesProduct'
import FormElements from './pages/Forms/FormElements'
import Blank from './pages/Blank'
import AppLayout from './layout/AppLayout'
import { ScrollToTop } from './components/common/ScrollToTop'
import Home from './pages/Dashboard/Home'
import ProtectedRoute from './components/ProtectedRoute'
import { Role } from './constants/Roles'
import { AppPath } from './constants/Paths'

export default function App() {
  // Tạm thời hard-code role (sau này có thể lấy từ localStorage hoặc API)
  // const userRole: Role = Role.PRODUCT_STAFF // 'admin' | 'content-staff' | 'product-staff'
  const storedRole = localStorage.getItem('role')
  const userRole = storedRole && Object.values(Role).includes(storedRole as Role) ? (storedRole as Role) : null

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* === AUTH ROUTES === */}
        <Route index path={AppPath.SIGN_IN} element={<SignIn />} />
        <Route path={AppPath.SIGN_UP} element={<SignUp />} />

        {/* === ADMIN ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route index path={AppPath.HOME} element={<Home />} />
            {/* Tables */}
            <Route path={AppPath.BASIC_TABLES} element={<BasicTables />} />

            {/* UI */}
            <Route path={AppPath.ALERTS} element={<Alerts />} />
            <Route path={AppPath.AVATARS} element={<Avatars />} />
            <Route path={AppPath.BADGE} element={<Badges />} />
            <Route path={AppPath.BUTTONS} element={<Buttons />} />
            <Route path={AppPath.IMAGES} element={<Images />} />
            <Route path={AppPath.VIDEOS} element={<Videos />} />

            {/* Charts */}
            <Route path={AppPath.LINE_CHART} element={<LineChart />} />
            <Route path={AppPath.BAR_CHART} element={<BarChart />} />

            {/* Others */}
            <Route path={AppPath.PROFILE} element={<UserProfiles />} />
            <Route path={AppPath.CALENDAR} element={<Calendar />} />
          </Route>
        </Route>

        {/* === ONLY CONTENT STAFF ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.CONTENT_STAFF]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.FORM_ELEMENTS} element={<FormElements />} />
          </Route>
        </Route>

        {/* === CONTENT STAFF AND ADMIN ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.CONTENT_STAFF]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.BASIC_TABLES_PRODUCT} element={<BasicTablesProduct />} />
            <Route path={AppPath.BLANK} element={<Blank />} />
          </Route>
        </Route>

        {/* === PRODUCT STAFF AND ADMIN ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.PRODUCT_STAFF]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.BASIC_TABLES_ORDER} element={<BasicTablesOrder />} />
          </Route>
        </Route>

        {/* === 404 FALLBACK === */}
        <Route path={AppPath.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Router>
  )
}
