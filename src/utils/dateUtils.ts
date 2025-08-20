// Helper to get the start of the week (Saturday) for any given date
export const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 6=Sat
    const diff = day < 6 ? day + 1 : 0; // Days to subtract to get to last Saturday
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0); // Normalize to the beginning of the day
    return d;
};

// Helper function to get the formatted dates for the current week based on a Saturday start
export const getWeekDates = (startOfWeek: Date): Record<string, string> => {
    const weekDates: Record<string, string> = {};
    const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    
    for (let i = 0; i < 6; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        weekDates[days[i]] = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return weekDates;
};