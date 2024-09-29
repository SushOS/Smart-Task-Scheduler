from langchain_core.prompts import ChatPromptTemplate          # type: ignore
from langchain_ollama.llms import OllamaLLM                    # type: ignore
import streamlit as st                                         # type: ignore
import datetime

st.title("Plan your Day!!")

# Set up conversation memory
if 'memory' not in st.session_state:
    st.session_state.memory = []

# Set up task list and preferences in session state if not present
if 'tasks' not in st.session_state:
    st.session_state['tasks'] = []
if 'preferences' not in st.session_state:
    st.session_state['preferences'] = {}

# LLM model
template = """
Question: {question}
Answer: Let's think step by step.
"""
prompt = ChatPromptTemplate.from_template(template)
model = OllamaLLM(model="llama3")

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

def create_timetable_with_llm():
    if 'preferences' in st.session_state and 'tasks' in st.session_state:
        preferences = st.session_state['preferences']
        tasks = st.session_state['tasks']

        # Combine the preferences and tasks into a prompt for the LLM
        prompt = f"""
        Given the following user preferences: 
        - Working hours: {preferences['working_hours']}
        - Relaxing hours: {preferences['relaxing_hours']}
        - Playing hours: {preferences['playing_hours']} (Playtime from {preferences['play_start_time']} to {preferences['play_end_time']})
        - Goals: {', '.join(preferences['goals'])}

        And these tasks:
        {', '.join([f"Task: {task['task_name']}, Category: {task['category']}, Deadline: {task['deadline']}, Estimated Time: {task['estimated_time']} hours, Priority: {task['priority']}" for task in tasks])}

        Please generate an optimal timetable that balances these tasks while fulfilling the user's preferences.
        """

        # Use the LLM to generate the timetable (assuming `model` is your LLM)
        response = model(prompt)
        
        # Output the generated timetable
        st.write("Generated Timetable:")
        st.write(response)

# Generate timetable button
if st.button("Generate Timetable"):
    if st.session_state['tasks']:
        create_timetable_with_llm()
    else:
        st.warning("Please add tasks before generating the timetable!")

# ------------------------------------------------------------------------

# Add a button to clear tasks and preferences
if st.button("Clear All"):
    st.session_state['tasks'] = []
    st.session_state['preferences'] = {}
    st.success("All tasks and preferences cleared!")