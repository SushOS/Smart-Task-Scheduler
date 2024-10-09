import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from "../Navbar/Navbar";
import TimetableChat from '../TimetableChat/TimetableChat';
import bgimg from '../../assets/bg.jpg';
import styles from './Timetable.module.css';
import { base_url } from '../../assets/help';

const Timetable = () => {
    const [schedule, setSchedule] = useState(null);
    const [preferences, setPreferences] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [timetableId, setTimetableId] = useState(null);
    const [filter, setFilter] = useState('pending'); // Default filter is 'pending'
    const navigate = useNavigate();

    const fetchTasks = async (userId) => {
        try {
            const response = await fetch(`${base_url}/tasks/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setTasks(data);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    const fetchpreferences = async (userId) => {
        try {
            const response = await fetch(`${base_url}/preferences/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setPreferences(data);
            } else {
                setPreferences([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setPreferences([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user.id;
        fetchTasks(userId);
        fetchpreferences(userId)
    }, []);

    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';

        const fetchTimetable = async () => {
            const token = localStorage.getItem('access_token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user.id;

            try {
                // Clean up expired tasks
                await fetch(`${base_url}/timetable/cleanup/${userId}`, {
                    method: 'DELETE'
                });

                // Fetch latest timetable
                const response = await fetch(`${base_url}/timetable/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setSchedule(data.schedule);
                        setTimetableId(data._id);
                    }
                }
            } catch (error) {
                console.error('Error fetching timetable:', error);
            }
        };

        fetchTimetable();

        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
        };
    }, []);

    const handleTaskStatus = async (task, status) => {
        try {
            const taskId = task._id;  // ID in the timetable database
            const task_id = task.task_id; // ID in the tasks database
            
            // 1. Update the task status in the timetable database
            const timetableResponse = await fetch(`${base_url}/timetable/${timetableId}/task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }), // Update the status
            });
    
            if (timetableResponse.ok) {
                const updatedTimetable = await timetableResponse.json();
                setSchedule(updatedTimetable.schedule); // Update the state with the new schedule
    
                // 2. Check if the same task exists with pending status in current schedule
                const hasPendingTask = updatedTimetable.schedule.some(
                    scheduleItem => scheduleItem.task_id === task_id && 
                                  scheduleItem.status === 'pending' &&
                                  scheduleItem._id !== taskId  // Exclude the current task being updated
                );
    
                // Only update the tasks database if there are no pending instances
                if (!hasPendingTask) {
                    const tasksResponse = await fetch(`${base_url}/tasks/${task_id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ status }), // Update the status in the tasks database
                    });
    
                    if (tasksResponse.ok) {
                        console.log('Task status updated in tasks database successfully.');
                    } else {
                        console.error('Failed to update task status in tasks database');
                    }
                } else {
                    console.log('Task not updated in tasks database as pending instances exist');
                }
            } else {
                console.error('Failed to update task status in timetable');
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };
    
    // Filter tasks based on the current filter state
    const filteredSchedule = schedule ? schedule.filter(item => item.status === filter) : [];

    if (!schedule) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <div className={styles.noSchedule}>
                        <h2>No Timetable Generated</h2>
                        <p>Please go back to the tasks page and generate a timetable first.</p>
                        <button onClick={() => navigate('/tasks')} className={styles.backButton}>
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const handleScheduleUpdate = (newSchedule) => {
        setSchedule(newSchedule);
    };

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <h1>Your Schedule</h1>

                {/* Filter Dropdown */}
                <div className={styles.filterContainer}>
                    <label>Status: </label>
                    <select 
                        id="statusFilter" 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className={styles.filterDropdown}
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                    </select>
                </div>

                <div className={styles.timetableContainer}>
                    <table className={styles.timetable}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Activity</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                {filter === 'pending' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedule.map((item, index) => (
                                <tr 
                                    key={index} 
                                >
                                    <td>{item.date}</td>
                                    <td>{item.time}</td>
                                    <td>{item.activity}</td>
                                    <td>{item.category}</td>
                                    <td>{item.priority || 'N/A'}</td>
                                    <td>{item.status.toUpperCase()}</td>
                                    {filter === 'pending' && <td>
                                        {item._id && item.status === 'pending' && (
                                            <div className={styles.actionButtons}>
                                                <button 
                                                    onClick={() => handleTaskStatus(item, 'completed')}
                                                    className={styles.completeButton}
                                                >
                                                    Completed
                                                </button>
                                                <button 
                                                    onClick={() => handleTaskStatus(item, 'missed')}
                                                    className={styles.missedButton}
                                                >
                                                    Missed
                                                </button>
                                            </div>
                                        )}
                                    </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <TimetableChat
                preferences={preferences}
                tasks={tasks}
                schedule={schedule}
                onScheduleUpdate={handleScheduleUpdate}
            />
        </>
    );
};

export default Timetable;
