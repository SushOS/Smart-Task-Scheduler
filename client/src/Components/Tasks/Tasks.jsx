import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './Tasks.module.css';
import Navbar from "../Navbar/Navbar";
import bgimg from '../../assets/bg.jpg';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { base_url } from '../../assets/help';
import { Plus, X } from 'lucide-react';

const Tasks = () => {
    useEffect(() => {
        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        
        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
        };
    }, [bgimg]);

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        taskName: '',
        category: '',
        deadline_date: '',
        deadline_time: '',
        estimatedTime: '',
        priority: 'Medium',
    });
    const [editTaskId, setEditTaskId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddTask, setShowAddTask] = useState(false);

    const navigate = useNavigate()

    const formRef = useRef(null);

    useEffect(() => {
        if(!showAddTask){
            setEditTaskId(null);
            setNewTask({ taskName: '', category: '', deadline_date: '', deadline_time: '', estimatedTime: '', priority: 'Medium' });
            setEditTaskId(null);
        }

    },[showAddTask]);

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

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user.id;
        fetchTasks(userId);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user.id;

        const deadlineDate = new Date(`${newTask.deadline_date}T${newTask.deadline_time}`);
        const method = editTaskId ? 'PUT' : 'POST';
        const url = editTaskId ? `${base_url}/tasks/${editTaskId}` : `${base_url}/tasks`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTask,
                    userId,
                }),
            });
            if (response.ok) {
                const token = localStorage.getItem('access_token');
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.user.id;
                fetchTasks(userId);
                setSuccess(editTaskId ? 'Task updated successfully!' : 'Task added successfully!');
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
                setNewTask({ taskName: '', category: '', deadline_date: '', deadline_time: '', estimatedTime: '', priority: 'Medium' });
                setEditTaskId(null);
                setShowAddTask(false);
                
            } else {
                setError('Failed to save task');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            setError('Error saving task');
            setTimeout(() => {
                setError('');
            }, 3000);
            const token = localStorage.getItem('access_token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user.id;
            fetchTasks(userId);
        }
    };

    function convertTo24HourFormat(timeString) {
        const [hour, minute] = timeString.split(':');
        let formattedHour = parseInt(hour);

        return `${formattedHour}:${minute}`;
    }

    const handleEdit = (task) => {
        setEditTaskId(task._id);
        setNewTask({
            taskName: task.taskName,
            category: task.category,
            deadline_date: new Date(task.deadline_date).toISOString().split('T')[0],
            deadline_time: task.deadline_time,
            estimatedTime: task.estimatedTime,
            priority: task.priority,
        });
        setShowAddTask(true);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Optional: Focus on the first input field
        setTimeout(() => {
            if (formRef.current) {
                const firstInput = formRef.current.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }, 1000);
    };

    const handleDelete = async (taskId) => {
        try {
            const response = await fetch(`${base_url}/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchTasks();
                setSuccess('Task deleted successfully!');
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            } else {
                setError('Failed to delete task');
                setTimeout(() => {
                    setError('');
                }, 3000);
            }
            const token = localStorage.getItem('access_token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user.id;
            fetchTasks(userId);
        } catch (error) {
            console.error('Error deleting task:', error);
            setError('Error deleting task');
        }
    };

    const [showPopup, setShowPopup] = useState(false);
    const [taskdelete, settaskdelete] = useState(null);

    const openPopup = (taskid) => {
        settaskdelete(taskid);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        settaskdelete(null);
    };

    const confirmDelete = () => {
        handleDelete(taskdelete);
        closePopup();
    };

    return (
        <>
            <Navbar />
            {showPopup && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete ?</p>
                        <button onClick={confirmDelete}>Yes</button>
                        <button onClick={closePopup}>No</button>
                    </div>
                </div>
            )}
            <div className={styles.pagetop}>
            <h1 className={styles.h1name}> What's Your Plan Today ?!</h1>
            <button 
                onClick={() => setShowAddTask(!showAddTask)} 
                className={styles.addButton}
            >
                {showAddTask ? <X size={40} /> : <Plus size={40} />}
            </button>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>{success}</p>}

            {showAddTask && (
                <div className={styles.taskaddbox}>
                <form ref={formRef} onSubmit={handleSubmit} className={styles.taskForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="taskName">Task Name:</label>
                        <input
                            id="taskName"
                            type="text"
                            name="taskName"
                            value={newTask.taskName}
                            onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
                            required
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="category">Category:</label>
                        <input
                            id="category"
                            type="text"
                            name="category"
                            value={newTask.category}
                            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                            required
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="deadline_date">Deadline:</label>
                            <input
                                id="deadline_date"
                                type="date"
                                name="deadline_date"
                                value={newTask.deadline_date}
                                onChange={(e) => setNewTask({ ...newTask, deadline_date: e.target.value })}
                                required
                                className={styles.formInput}
                            />
                            <input
                                id="deadline_time"
                                type="time"
                                name="deadline_time"
                                value={newTask.deadline_time}
                                onChange={(e) => setNewTask({ ...newTask, deadline_time: e.target.value })}
                                required
                                className={styles.formInput}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="estimatedTime">Estimated Time:</label>
                        <input
                            id="estimatedTime"
                            type="time"
                            name="estimatedTime"
                            placeholder='(hours)'
                            value={newTask.estimatedTime}
                            onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                            required
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="priority">Priority:</label>
                        <select
                            id="priority"
                            name="priority"
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            required
                            className={styles.formSelect}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        {editTaskId ? 'Update Task' : 'Add Task'}
                    </button>
                </form>
                </div>
            )}
            <footer className={styles.generatebutton}>
                <button onClick={() => navigate('/timetable')} >Generate</button>
            </footer>
            
            <div className={styles.tasksContainer}>
                

                {tasks.length === 0 ? (
                    <p className={styles.emptyMessage}>No tasks added yet!</p>
                ) : (
                    <ul className={styles.taskList}>
                        {tasks.map((task) => (
                            <li key={task._id} className={styles.taskItem}>
                                <div className={styles.taskleft}>
                                    <h3 className={styles.taskName}>{task.taskName}</h3>
                                    <p className={styles.taskDetail}>Category: {task.category}</p>
                                    <p className={styles.taskDetail}>
                                    Deadline: {new Date(task.deadline_date).toDateString()} {convertTo24HourFormat(task.deadline_time)}
                                    </p>
                                    <p className={styles.taskDetail}>Estimated Time: {task.estimatedTime} hours</p>
                                    <p className={styles.taskDetail}>Priority: {task.priority}</p>
                                </div>
                                <div className={styles.taskActions}>
                                    <button onClick={() => handleEdit(task)} className={styles.editButton}><FaEdit color="#3d3d3d" size={30} /></button>
                                    <button onClick={() => openPopup(task._id)} className={styles.deleteButton}><MdDelete color="#3d3d3d" size={30} /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                
            </div>

            
        </>
    );
};

export default Tasks;