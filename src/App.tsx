import { Route, BrowserRouter as Router, Routes } from 'react-router'
import { ScrollToTop } from './components/common/ScrollToTop'

import { AppPath } from './constants/Paths'
import { Role } from './constants/Roles'

import { lazy, useContext } from 'react'

import { AppContext } from './context/AuthContext'
import AppLayout from './layout/AppLayout'
import SignIn from './pages/AuthPages/SignIn'
import SignUp from './pages/AuthPages/SignUp'
import Calendar from './pages/Calendar'
import BarChart from './pages/Charts/BarChart'
import LineChart from './pages/Charts/LineChart'
import Home from './pages/Dashboard/Home'
import FormElements from './pages/Forms/FormElements'
import NotFound from './pages/OtherPage/NotFound'
import ProductDetail from './pages/Product/ProductDetail'
// import BasicTables from './pages/Tables/BasicTables'
import { ProtectedRoute } from './components/ProtectedRoute'

import WorkSchedulesManagement from './components/tables/BasicTables/BasicTableSchedule'
import ManageBlogs from './pages/Blogs/ManageBlogs'
import AppoimentDashboard from './pages/Dashboard/AppoimentDashboard'

import MedicalReportList from './pages/Report/MedicalReportList'
import BasicTablesBrand from './pages/Tables/BasicTablesBrand'
import BasicTablesCategory from './pages/Tables/BasicTablesCategory'
import BasicTablesCountries from './pages/Tables/BasicTablesCountries'
import BasicTablesOrder from './pages/Tables/BasicTablesOrder'
import BasicTablesPatients from './pages/Tables/BasicTablesPatients'
import BasicTablesProduct from './pages/Tables/BasicTablesProduct'
import BasicTablesRegistration from './pages/Tables/BasicTablesRegistration'
import BasicTablesRoom from './pages/Tables/BasicTablesRoom'
import BasicTablesService from './pages/Tables/BasicTablesService'
import BasicTablesSkinCondition from './pages/Tables/BasicTablesSkinCondition'
import BasicTablesSkinType from './pages/Tables/BasicTablesSkinType'
import BasicTablesSlot from './pages/Tables/BasicTablesSlot'
import BasicTablesTemplate from './pages/Tables/BasicTablesTemplate'
import BasicTablesVariation from './pages/Tables/BasicTablesVariation'
import BasicTablesVoucher from './pages/Tables/BasicTablesVoucher'
import Alerts from './pages/UiElements/Alerts'
import Avatars from './pages/UiElements/Avatars'
import Badges from './pages/UiElements/Badges'
import Buttons from './pages/UiElements/Buttons'
import Images from './pages/UiElements/Images'
import Videos from './pages/UiElements/Videos'
import UserProfiles from './pages/UserProfiles'
import { ErrorBoundary } from './utils/ErrorBoundary'
import TreatmentPlanTab from './pages/Patients/PatientDetail'

const BasicTables = lazy(() => import('./pages/Tables/BasicTables'))

export default function App() {
  const { profile } = useContext(AppContext)

  const userRole = profile?.role.replace('_', '').toLowerCase()

  console.log('userRole', userRole)

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
            <Route index path={AppPath.DASHBOARD_APPOINTMENTS} element={<AppoimentDashboard />} />
            {/* Tables */}
            <Route path={AppPath.BASIC_TABLES} element={<BasicTables />} />

            <Route path={AppPath.BASIC_TABLES_COUNTRIES} element={<BasicTablesCountries />} />
            <Route path={AppPath.BASIC_TABLES_VOUCHER} element={<BasicTablesVoucher />} />

            <Route path={AppPath.BASIC_TABLES_VARIATION} element={<BasicTablesVariation />} />
            <Route
              path={AppPath.BASIC_TABLES_SKINCONDITION}
              element={
                <ErrorBoundary fallback={<div>Oops! Something went wrong on this page.</div>}>
                  <BasicTablesSkinCondition />
                </ErrorBoundary>
              }
            />

            <Route path={AppPath.BASIC_TABLES_SKINTYPE} element={<BasicTablesSkinType />} />

            <Route path={AppPath.DETAIL_PRODUCT} element={<ProductDetail />} />
            {/* <Route path={AppPath.BASIC_TABLES_TEMPLATE} element={<BasicTablesTemplate />} /> */}

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
            {/* <Route path={`${AppPath.PROFILE}/:id`} element={<UserProfiles />} /> */}
            {/* <Route path={AppPath.CALENDAR} element={<Calendar />} /> */}
            <Route path={AppPath.FORM_ELEMENTS} element={<FormElements />} />
            {/* Content */}
            <Route path={AppPath.BLOGS} element={<ManageBlogs />} />
          </Route>
        </Route>

        {/* === SCHEDULAR STAFF AND SKINCARE SPECIALIST === */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[Role.ADMIN, Role.SCHEDULE_MANAGER, Role.BEAUTY_ADVISOR]}
              userRole={userRole}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route path={AppPath.CALENDAR} element={<Calendar />} />
            <Route path={AppPath.BASIC_TABLES_SHEDULES} element={<WorkSchedulesManagement />} />
            <Route path={AppPath.BASIC_TABLES_REGISTRATION} element={<BasicTablesRegistration />} />
          </Route>
        </Route>

        {/* === Scheular Manage and Admin === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.SCHEDULE_MANAGER, Role.ADMIN]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.BASIC_TABLES_SLOT} element={<BasicTablesSlot />} />
            <Route path={AppPath.BASIC_TABLES_TEMPLATE} element={<BasicTablesTemplate />} />
            <Route path={AppPath.BASIC_TABLES_ROOM} element={<BasicTablesRoom />} />
            <Route path={AppPath.BASIC_TABLES_SERVICE} element={<BasicTablesService />} />
            {/* <Route path={AppPath.BASIC_TABLES_REGISTRATION} element={<BasicTableRegistration />} /> */}
          </Route>
        </Route>

        {/* === Only SKINCARE SPECIALIST === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.BEAUTY_ADVISOR]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.PATIENTS} element={<BasicTablesPatients />} />

            {/* <Route path={AppPath.BASIC_TABLES_REGISTRATION} element={<BasicTableRegistration />} /> */}
          </Route>
        </Route>

        {/* === Only BEAUTY_ADVISOR AND ADMIN === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.BEAUTY_ADVISOR, Role.ADMIN]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.BASIC_TABLES_TEMPLATE} element={<BasicTablesTemplate />} />
            <Route path={`${AppPath.PROFILE}/:id`} element={<UserProfiles />} />

            <Route path={`${AppPath.MEDICAL_RECORD}/:id`} element={<TreatmentPlanTab />} />
            <Route path={`${AppPath.REPORT}/:id`} element={<MedicalReportList />} />
          </Route>
        </Route>

        {/* === PRODUCT STAFF AND ADMIN ROUTES === */}
        <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.STORE_STAFF]} userRole={userRole} />}>
          <Route element={<AppLayout />}>
            <Route path={AppPath.BASIC_TABLES_ORDER} element={<BasicTablesOrder />} />
            <Route path={AppPath.BASIC_TABLES_PRODUCT} element={<BasicTablesProduct />} />
            <Route path={AppPath.BASIC_TABLES_CATEGORY} element={<BasicTablesCategory />} />
            <Route path={AppPath.BASIC_TABLES_BRAND} element={<BasicTablesBrand />} />
          </Route>
        </Route>
        {/* === 404 FALLBACK === */}
        <Route path={AppPath.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Router>
  )
}
