import streamlit as st                                 
import datetime
import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv
load_dotenv()

groq_api_key = os.environ['GROQ_API_KEY']

llm = ChatGroq(
    temperature=0,
    groq_api_key=groq_api_key,
    model_name="llama-3.2-11b-text-preview",
)

st.title("Plan your Day!!")

# Set up conversation memory
if 'memory' not in st.session_state:

    st.session_state.memory = []

if 'chat_count' not in st.session_state:
    st.session_state.chat_count = 0

# Set up task list and preferences in session state if not present
if 'tasks' not in st.session_state:
    st.session_state['tasks'] = []
if 'preferences' not in st.session_state:
    st.session_state['preferences'] = {}

# ------------------------------------------------------------------------

def scheduling_preferences_form():
    st.header("Scheduling Preferences")

    with st.form("preferences_form"):
        # Scheduling hours
        start_time = st.time_input("Start time", value=datetime.time(9, 0))
        end_time = st.time_input("End time", value=datetime.time(18, 0))
        
        # Number of hours for each activity
        working_hours = st.number_input("Number of Working Hours", min_value=1, max_value=24)
        relaxing_hours = st.number_input("Number of Relaxing Hours", min_value=0, max_value=24)
        playing_hours = st.number_input("Number of Playing Hours", min_value=0, max_value=24)
        
        # Playtime preference
        play_start_time = st.time_input("Playtime Start")
        play_end_time = st.time_input("Playtime End")
        
        # List of goals
        goals = st.text_area("List of Goals (comma-separated)", placeholder="Enter goals")
        
        # Submit button
        submit = st.form_submit_button("Save Preferences")
        
    if submit:
        st.session_state['preferences'] = {
            'start_time': start_time,
            'end_time': end_time,
            'working_hours': working_hours,
            'relaxing_hours': relaxing_hours,
            'playing_hours': playing_hours,
            'play_start_time': play_start_time,
            'play_end_time': play_end_time,
            'goals': [goal.strip() for goal in goals.split(',')]
        }
        st.success("Preferences saved!")

# Call the preferences form
scheduling_preferences_form()

# ------------------------------------------------------------------------

def task_entry_form():
    st.header("Add Tasks")

    with st.form("task_form"):
        # Task details
        task_name = st.text_input("Task Name")
        category = st.text_input("Category")
        deadline = st.date_input("Deadline", value=datetime.date.today())
        estimated_time = st.number_input("Estimated Time (hours)", min_value=0.5, step=0.5)
        priority = st.selectbox("Priority", options=['Low', 'Medium', 'High'])

        # Submit button
        submit = st.form_submit_button("Add Task")

    if submit:
        st.session_state['tasks'].append({
            'task_name': task_name,
            'category': category,
            'deadline': deadline,
            'estimated_time': estimated_time,
            'priority': priority
        })
        st.success(f"Task '{task_name}' added successfully!")

        # Display the current tasks
        st.write("Current Tasks:")
        for idx, task in enumerate(st.session_state['tasks'], 1):
            st.write(f"{idx}. {task['task_name']} - {task['category']} - {task['estimated_time']} hours - Priority: {task['priority']}")

# Call the task entry form
task_entry_form()

# ------------------------------------------------------------------------

def display_tasks():
    st.write("Current Tasks:")
    for idx, task in enumerate(st.session_state['tasks'], 1):
        st.write(f"{idx}. {task['task_name']} - {task['category']} - {task['estimated_time']} hours - Priority: {task['priority']}")

def create_timetable_with_llm():
    if 'preferences' in st.session_state and 'tasks' in st.session_state:
        preferences = st.session_state['preferences']
        tasks = st.session_state['tasks']

        # Combine the preferences and tasks into a prompt for the LLM
        prompt_text = f"""
        Given the following user preferences: 
        - Working hours: {preferences['working_hours']}
        - Relaxing hours: {preferences['relaxing_hours']}
        - Playing hours: {preferences['playing_hours']} (Playtime from {preferences['play_start_time']} to {preferences['play_end_time']})
        - Goals: {', '.join(preferences['goals'])}

        And these tasks:
        {', '.join([f"Task: {task['task_name']}, Category: {task['category']}, Deadline: {task['deadline']}, Estimated Time: {task['estimated_time']} hours, Priority: {task['priority']}" for task in tasks])}

        Please generate an optimal timetable that balances these tasks while fulfilling the user's preferences. The tasks are
        not necessarily to be completed at one go, but can be broken into multiple slots which can be completed at different
        times, but before the deadline.

        IMPORTANT INSTRUCTIONS (PLEASE FOCUS ON THESE):
        0. Make THE TIMETABLE STARTING FROM THE START TIME AND ENDING AT THE END TIME.
        1. IT IS NECESSARY TO COMPLETE THE TASKS BEFORE THE DEADLINES.
        2. DON'T ADD UNNECESSARY ACTIVITIES IF TIME STILL REMAINS AFTER COMPLETION OF ALL THE TASKS OF THAT DAY.
        3. ESTIMATED TIMES OF THE TASKS CAN BE REDUCED TO FIT ALL THE TASKS BEFORE THE DEADLINE.
        4. YOU CANNOT MAKE AN OVERDUE TIMETABLE.
        5. FOCUS ON THE OPTIMALITY OF THE TIMETABLE.
        6. TRY TO GIVE SHORT BREAKS AT REGULAR INTERVALS RATHER THAN GIVING A LONG BREAK AT ONCE.
        7. IF THE DEADLINE OF A TASK IS NOT TODAY, YOU CAN COMPLETE A PART OF IT TODAY IF TIME REMAINS, ELSE YOU CAN COMPLETE IT IN SUBSEQUENT DAYS BEFORE THE DEADLINE.
        8. REMEMBER TO COMPLETE ALL TASKS BEFORE THEIR RESPECTIVE DEADLINES.
        9. IT IS NOT NECESSARY TO COMPLETE A TASK AND THEN GO TO THE NEW TASK. YOU CAN START WORKING ON THE NEW TASK WHILE WORKING ON THE CURRENT TASK.
        10. YOU CAN ALSO START WORKING ON THE NEW TASK BEFORE COMPLETING THE CURRENT TASK.
        11. TRY TO MAKE THE PLAYING HOURS CONTINOUS.
        12. ALLOCATE PROPER TIME FOR MEALS

        TIMETABLE FORMAT:
        Please generate the timetable in the following format:
        Time : Task

        For example:
        09:00 : Start work on Project A
        10:30 : Short break
        10:45 : Continue Project A or Start with Project D or any other task
        12:00 : Lunch break
        ...and so on.

        Ensure that the timetable follows this format strictly.
        """

        # Add chat history to the prompt
        if st.session_state.memory:
            chat_history = "\n".join([f"Human: {m['human']}\nAI: {m['ai']}" for m in st.session_state.memory])
            prompt_text += f"\n\nPrevious conversation:\n{chat_history}"

        response = llm.invoke(prompt_text)
        
        # Store the conversation in memory
        st.session_state.memory.append({"human": prompt_text, "ai": response.content})
        st.session_state.chat_count += 1

        # Output the generated timetable
        st.write("Generated Timetable:")
        st.write(response.content)

        # Display tasks after generating the timetable
        display_tasks()

# Generate timetable button
if st.button("Generate Timetable"):
    if st.session_state['tasks']:
        if st.session_state.chat_count < 5:
            create_timetable_with_llm()
        else:
            st.warning("You have reached the maximum number of conversations with the AI. Please clear the chat history to continue.")
    else:
        st.warning("Please add tasks before generating the timetable!")

# Add a text input for user queries
user_query = st.text_input("Ask a question about your timetable:")

if user_query:
    if st.session_state.chat_count < 5:
        # Prepare the prompt with user preferences, tasks, and the new query
        preferences = st.session_state.get('preferences', {})
        tasks = st.session_state.get('tasks', [])
        
        prompt_text = f"""
        User Preferences:
        - Working hours: {preferences.get('working_hours', 'Not set')}
        - Relaxing hours: {preferences.get('relaxing_hours', 'Not set')}
        - Playing hours: {preferences.get('playing_hours', 'Not set')} (Playtime from {preferences.get('play_start_time', 'Not set')} to {preferences.get('play_end_time', 'Not set')})
        - Goals: {', '.join(preferences.get('goals', ['Not set']))}

        User Tasks:
        {', '.join([f"Task: {task['task_name']}, Category: {task['category']}, Deadline: {task['deadline']}, Estimated Time: {task['estimated_time']} hours, Priority: {task['priority']}" for task in tasks]) if tasks else 'No tasks set'}

        User Query: {user_query}

        Please answer the user's query while taking into account the user preferences and tasks. Ensure that any suggestions or changes to the timetable meet all the conditions and requirements in the schedule preferences and also meet the constraints of the deadlines of the user tasks.
        """

        response = llm.invoke(prompt_text)

        # Store the conversation in memory
        st.session_state.memory.append({"human": user_query, "ai": response.content})
        st.session_state.chat_count += 1

        # Display the response
        st.write("AI Response:")
        st.write(response.content)

        # Display tasks after the response
        display_tasks()
    else:
        st.warning("You have reached the maximum number of conversations with the AI. Please clear the chat history to continue.")

# Add a button to clear tasks, preferences, and chat history
if st.button("Clear All"):
    st.session_state['tasks'] = []
    st.session_state['preferences'] = {}
    st.session_state.memory = []
    st.session_state.chat_count = 0
    st.success("All tasks, preferences, and chat history cleared!")