import { Routes, Route } from 'react-router-dom';
import { Center, Title } from '@mantine/core';

// Core & Auth
import AppLayout from './components/AppLayout';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PersistLogin from './components/PersistLogin';
import Home from './components/Home';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';

// Admin Pages
import AdminDashboard from './features/admin/dashboard/AdminDashboard';
import UserManagement from './features/admin/users/UserManagement';
import ClassManagement from './features/admin/classes/ClassManagement';
import ScheduleManagement from './features/admin/schedules/ScheduleManagement';
import AnnouncementManagement from './features/admin/announcements/AnnouncementManagement';
import FinanceManagement from './features/admin/finance/FinanceManagement';
import FeeCollection from './features/admin/fees/FeeCollection';
import FeeHistory from './features/admin/fees/FeeHistory';

// Teacher Pages
import TeacherDashboard from './features/teacher/dashboard/TeacherDashboard';
import TeacherSchedule from './features/teacher/schedule/TeacherSchedule';
import TeacherAttendance from './features/teacher/attendance/TeacherAttendance';

// Student Pages
import StudentDashboard from './features/student/dashboard/StudentDashboard';
import StudentSchedule from './features/student/schedule/StudentSchedule';
import StudentAttendance from './features/student/attendance/StudentAttendance';
import StudentResults from './features/student/results/StudentResults';
import StudentFees from './features/student/fees/StudentFees';
import StudentProfile from './features/student/profile/StudentProfile';

function App() {
    return (
        <Routes>
            <Route element={<AuthLayout />}><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /></Route>
            <Route element={<PersistLogin />}>
                <Route path="/" element={<Home />} />
                <Route element={<AppLayout />}>
                    <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                        <Route path="admin" element={<AdminDashboard />} />
                        <Route path="admin/users" element={<UserManagement />} />
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
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
                        <Route path="student" element={<StudentDashboard />} />
                        <Route path="student/schedule" element={<StudentSchedule />} />
                        <Route path="student/attendance" element={<StudentAttendance />} />
                        <Route path="student/results" element={<StudentResults />} />
                        <Route path="student/fees" element={<StudentFees />} />
                        <Route path="student/profile" element={<StudentProfile />} />
                    </Route>
                </Route>
            </Route>
            <Route path="*" element={<Center style={{ height: '100vh' }}><Title>404 - Page Not Found</Title></Center>} />
        </Routes>
    );
}
export default App;