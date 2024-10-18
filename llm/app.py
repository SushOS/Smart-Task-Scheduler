from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_groq import ChatGroq
import json
import os
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ['GROQ_API_KEY']

app = Flask(__name__)
CORS(app)

llm = ChatGroq(
    temperature=0,
    groq_api_key=GROQ_API_KEY,
    model_name="llama-3.1-70b-versatile",
)

@app.route('/api/generate-timetable', methods=['POST'])
def generate_timetable():
    try:
        data = request.json
        tasks = data.get('tasks', [])
        preferences = data.get('preferences', {})

        # Format the tasks for the prompt
        formatted_tasks = []
        for task in tasks:
            formatted_task = (
                f"Task_id: {task['_id']}\n"
                f"Task: {task['taskName']}\n"
                f"Deadline_date: {task['deadline_date']}\n"
                f"Deadline_time: {task['deadline_time']}\n"
                f"Category: {task['category']}\n"
                f"Time Required: {task['estimatedTime']}\n"
                f"Priority: {task['priority']}"
            )
            formatted_tasks.append(formatted_task)

        # Enhanced prompt with better structure and constraints
        prompt = f"""As an intelligent scheduling assistant, create an optimized schedule that maximizes productivity while maintaining work-life balance. Consider the following parameters carefully:

USER PREFERENCES AND CONSTRAINTS:
Working Hours: {preferences.get('workingHours')} hours per day
Relaxation Time: {preferences.get('relaxingHours')} hours per day
Physical Activity: {preferences.get('playingHours')} hours per day
Daily Schedule Window: {preferences.get('schedulingStartHour')} to {preferences.get('schedulingEndHour')}
Physical Activity Preferred Time: {preferences.get('playingStartTime')} to {preferences.get('playingEndTime')}

TASKS TO BE SCHEDULED:
{chr(10).join(formatted_tasks)}

PERSONAL GOALS:
{', '.join(preferences.get('goals', []))}

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

Please generate a JSON array of schedule items with the following structure for each entry:
'''
    "task_id": "string (use existing ID or N/A)",
    "date": "DD/MM/YYYY format",
    "time": "HH:MM format (24-hour)",
    "activity": "string (task name or break description)",
    "category": "string (Work/Play/Relax)",
    "priority": "string (High/Medium/Low, only for tasks)"
'''

"""

        # Get response from LLM
        response = llm.invoke(prompt)
        
        try:
            # Parse the JSON response
            schedule = json.loads(response.content)
            return jsonify({'schedule': schedule})
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract JSON-like content
            import re
            json_match = re.search(r'\[\s*{.*}\s*\]', response.content, re.DOTALL)
            if json_match:
                schedule = json.loads(json_match.group())
                return jsonify({'schedule': schedule})
            else:
                return jsonify({'error': 'Could not parse LLM response'}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/modify-timetable', methods=['POST'])
def modify_timetable():
    try:
        data = request.json
        user_request = data.get('userRequest', '')
        preferences = data.get('preferences', {})
        schedule = data.get('schedule',{})
        # tasks = data.get('tasks', [])
        chat_history = data.get('chatHistory', [])

        # Format the tasks for the prompt
        # formatted_tasks = []
        # for task in tasks:
        #     formatted_task = (
        #         f"Task_id: {task['_id']}\n"
        #         f"Task: {task['taskName']}\n"
        #         f"Deadline_date: {task['deadline_date']}\n"
        #         f"Deadline_time: {task['deadline_time']}\n"
        #         f"Category: {task['category']}\n"
        #         f"Time Required: {task['estimatedTime']}\n"
        #         f"Priority: {task['priority']}"
        #     )
        #     formatted_tasks.append(formatted_task)

        # Create a context-aware prompt that includes the user's request
        prompt = f"""As an intelligent scheduling assistant, analyze the user's request and modify the schedule accordingly. 

Most Important is USER REQUEST:
{user_request}

CURRENT CHAT CONTEXT:
{chr(10).join(f"{msg['role']}: {msg['content']}" for msg in chat_history[-3:] if msg['role'] != 'system')}

USER PREFERENCES AND CONSTRAINTS:
Working Hours: {preferences.get('workingHours')} hours per day
Relaxation Time: {preferences.get('relaxingHours')} hours per day
Physical Activity: {preferences.get('playingHours')} hours per day
Daily Schedule Window: {preferences.get('schedulingStartHour')} to {preferences.get('schedulingEndHour')}
Physical Activity Preferred Time: {preferences.get('playingStartTime')} to {preferences.get('playingEndTime')}


PERSONAL GOALS:
{', '.join(preferences.get('goals', []))}

PREVIOUS GENERATED SCHEDULE:
{schedule}

''If the task is already Completed or Missed keep it completed or missed.''

''' Incorporate User requests in the previously generated Schedule. Use the below rules while regenerating the timetable. '''

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

Please generate a JSON array of schedule items with the following structure for each entry:
'''
    "task_id": "string (use existing ID or N/A)",
    "date": "DD/MM/YYYY format",
    "time": "HH:MM format (24-hour)",
    "activity": "string (task name or break description)",
    "category": "string (Work/Play/Relax)",
    "priority": "string (High/Medium/Low, only for tasks)"
'''

"""

        # Get response from LLM
        response = llm.invoke(prompt)
        try:
            # Parse the JSON response
            schedule = json.loads(response.content)
            return jsonify({'schedule': schedule})
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract JSON-like content
            import re
            json_match = re.search(r'\[\s*{.*}\s*\]', response.content, re.DOTALL)
            if json_match:
                schedule = json.loads(json_match.group())
                return jsonify({'schedule': schedule})
            else:
                return jsonify({'error': 'Could not parse LLM response'}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'message': 'Sorry, I encountered an error while processing your request.',
            'error': str(e)
        }), 500
    

@app.route('/api/chattimetable', methods=['POST'])
def chat_timetable():
    try:
        data = request.json
        user_request = data.get('userRequest', '')
        schedule = data.get('schedule', {})
        chat_history = data.get('chatHistory', [])

        # Create a context-aware prompt
        prompt = f"""As an intelligent assistant, analyze the user's request and answer accordingly. 

USER Question:
{user_request}

CURRENT CHAT CONTEXT:
{chr(10).join(f"{msg['role']}: {msg['content']}" for msg in chat_history[-3:] if msg['role'] != 'system')}

PREVIOUS GENERATED SCHEDULE:
{schedule}

"Now give the best answer possible for the user's question or request based on the generated schedule." 

Please generate a simple string for the answer as belows and not generate anything else other than below example:

    "This is the message"


"""

        try:
            # Get response from LLM
            response = llm.invoke(prompt)
            print("Raw response:", response.content)  # Debug print

            # Parse the JSON response
            result = json.loads(response.content)
            return jsonify({'message': result})

        except json.JSONDecodeError:
            return jsonify({
                'message': 'I processed your request but encountered an error formatting the response. Please try rephrasing your request.',
                'error': 'Could not parse LLM response'
            }), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'message': 'Sorry, I encountered an error while processing your request.',
            'error': str(e)
        }), 500

    

if __name__ == '__main__':
    app.run(debug=True, port=5000)
