import { Routes, Route } from 'react-router-dom';
import { Center, Title } from '@mantine/core';
import AppLayout from './components/AppLayout';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PersistLogin from './components/PersistLogin';
import Home from './components/Home';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import AdminDashboard from './features/admin/dashboard/AdminDashboard';
import UserManagement from './features/admin/users/UserManagement';
import SubjectManagement from './features/admin/subjects/SubjectManagement';
import ClassManagement from './features/admin/classes/ClassManagement';
import ScheduleManagement from './features/admin/schedules/ScheduleManagement';
import AnnouncementManagement from './features/admin/announcements/AnnouncementManagement';
import FinanceManagement from './features/admin/finance/FinanceManagement';
import FeeCollection from './features/admin/fees/FeeCollection';
import FeeHistory from './features/admin/fees/FeeHistory';
import TeacherDashboard from './features/teacher/dashboard/TeacherDashboard';
import TeacherSchedule from './features/teacher/schedule/TeacherSchedule';
import TeacherAttendance from './features/teacher/attendance/TeacherAttendance';
import TeacherPerformance from './features/teacher/performance/TeacherPerformance';
import PerformanceHistory from './features/teacher/performance/PerformanceHistory';
import TeacherPlannerReview from './features/teacher/TeacherPlannerReview';
import TeacherPlannerView from './features/teacher/TeacherPlannerView';
import StudentDashboard from './features/student/dashboard/StudentDashboard';
import StudentSchedule from './features/student/schedule/StudentSchedule';
import StudentAttendance from './features/student/attendance/StudentAttendance';
import StudentResults from './features/student/results/StudentResults';
import StudentFees from './features/student/fees/StudentFees';
import StudentProfile from './features/student/profile/StudentProfile';
import StudentPerformance from './features/student/performance/StudentPerformance';
import DailyPlanner from './features/student/planner/DailyPlanner';
import PlannerHistory from './features/student/planner/PlannerHistory';
import GuardianLogin from './features/guardian/GuardianLogin';
import GuardianLayout from './features/guardian/GuardianLayout';
import GuardianPlannerApproval from './features/guardian/GuardianPlannerApproval';
import GuardianPlannerView from './features/guardian/GuardianPlannerView';

function App() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/guardian/login" element={<GuardianLogin />} />
            </Route>

            {/* A SINGLE PersistLogin now wraps ALL authenticated routes */}
            <Route element={<PersistLogin />}>
                <Route path="/" element={<Home />} />
                
                {/* Regular User Routes */}
                <Route element={<AppLayout />}>
                    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                        <Route path="admin" element={<AdminDashboard />} />
                        <Route path="admin/users" element={<UserManagement />} />
                        <Route path="admin/subjects" element={<SubjectManagement />} />
                        <Route path="admin/classes" element={<ClassManagement />} />
                        <Route path="admin/schedule" element={<ScheduleManagement />} />
                        <Route path="admin/announcements" element={<AnnouncementManagement />} />
                        <Route path="admin/finance" element={<FinanceManagement />} />
                        <Route path="admin/fees" element={<FeeCollection />} />
                        <Route path="admin/fees/history" element={<FeeHistory />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
                        <Route path="teacher" element={<TeacherDashboard />} />
                        <Route path="teacher/schedule" element={<TeacherSchedule />} />
                        <Route path="teacher/attendance" element={<TeacherAttendance />} />
                        <Route path="teacher/performance" element={<TeacherPerformance />} />
                        <Route path="teacher/performance-history" element={<PerformanceHistory />} />
                        <Route path="teacher/planner-review" element={<TeacherPlannerReview />} />
                        <Route path="teacher/planner/:plannerId" element={<TeacherPlannerView />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                        <Route path="student" element={<StudentDashboard />} />
                        <Route path="student/daily-planner" element={<DailyPlanner />} />
                        <Route path="student/planner-history" element={<PlannerHistory />} />
                        <Route path="student/schedule" element={<StudentSchedule />} />
                        <Route path="student/attendance" element={<StudentAttendance />} />
                        <Route path="student/performance" element={<StudentPerformance />} />
                        <Route path="student/results" element={<StudentResults />} />
                        <Route path="student/fees" element={<StudentFees />} />
                        <Route path="student/profile" element={<StudentProfile />} />
                    </Route>
                </Route>

                {/* Guardian-specific routes with their own layout */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<GuardianLayout />}>
                        <Route path="guardian/dashboard" element={<StudentDashboard isGuardian />} />
                        <Route path="guardian/planner-approval" element={<GuardianPlannerApproval />} />
                        <Route path="guardian/planner/:plannerId" element={<GuardianPlannerView />} />
                        <Route path="guardian/schedule" element={<StudentSchedule isGuardian />} />
                        <Route path="guardian/attendance" element={<StudentAttendance isGuardian />} />
                        <Route path="guardian/performance" element={<StudentPerformance isGuardian />} />
                        <Route path="guardian/results" element={<StudentResults isGuardian />} />
                        <Route path="guardian/fees" element={<StudentFees isGuardian />} />
                    </Route>
                </Route>
            </Route>

            {/* Fallback routes */}
            <Route path="/unauthorized" element={<Center style={{ height: '100vh' }}><Title>403 - Unauthorized</Title></Center>} />
            <Route path="*" element={<Center style={{ height: '100vh' }}><Title>404 - Page Not Found</Title></Center>} />
        </Routes>
    );
}
export default App;