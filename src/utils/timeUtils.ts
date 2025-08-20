export const formatTime = (timeString: string): string => {
    if (!timeString || !timeString.includes(':')) {
        return '';
    }
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    
    if (isNaN(h) || isNaN(m)) {
        return '';
    }

    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    const formattedMinutes = m < 10 ? `0${m}` : m;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// This function is now deprecated in favor of the new logic on the dashboard components
// It's kept here in case you need it elsewhere, but it's no longer used on the dashboards.
export const findNextClass = (schedule: any): string => {
    if (!schedule) return 'N/A';
    
    const now = new Date();
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toLowerCase();
    
    const todaysPeriods = schedule[dayOfWeek];
    if (!todaysPeriods || todaysPeriods.length === 0) {
        return 'No Classes Today';
    }

    const nowInMinutes = now.getHours() * 60 + now.getMinutes();

    let upcomingPeriod = null;

    const sortedPeriods = [...todaysPeriods].sort((a, b) => {
        const timeA = a.startTime ? parseInt(a.startTime.replace(':', ''), 10) : 0;
        const timeB = b.startTime ? parseInt(b.startTime.replace(':', ''), 10) : 0;
        return timeA - timeB;
    });

    for (const period of sortedPeriods) {
        if (period.subject && period.endTime) {
            const [endHours, endMinutes] = period.endTime.split(':').map(Number);
            const periodEndInMinutes = endHours * 60 + endMinutes;
            
            if (periodEndInMinutes > nowInMinutes) {
                upcomingPeriod = period;
                break;
            }
        }
    }

    if (upcomingPeriod) {
        return `${upcomingPeriod.subject?.name} at ${formatTime(upcomingPeriod.startTime)}`;
    }

    return 'Classes are over for today';
};