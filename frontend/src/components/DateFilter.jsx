import React, { useState } from 'react';

function DateFilter({ onDateChange }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleApply = () => {
        onDateChange({ start: startDate, end: endDate });
    };

    return (
        <div className="date-filter">
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleApply}>
                Apply
            </button>
        </div>
    );
}

export default DateFilter;
