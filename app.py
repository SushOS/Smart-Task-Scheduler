# from langchain_core.prompts import ChatPromptTemplate
# from langchain_ollama.llms import OllamaLLM
# from langchain.memory import ConversationBufferMemory
# import streamlit as st

# st.title("Plan your Day!!")

# # Initialize memory
# memory = ConversationBufferMemory(return_messages=True)

# # Define the prompt template
# template = """
# Question: {question}
# Answer: Let's think step by step.
# """

# # Create the prompt template
# prompt = ChatPromptTemplate.from_template(template)

# # Load the model
# model = OllamaLLM(model="llama3")

# # Helper function to format the conversation history
# def format_history(messages):
#     formatted = []
#     for message in messages:
#         if isinstance(message, dict):
#             formatted.append(f"Human: {message.get('input', '')}")
#             formatted.append(f"Assistant: {message.get('output', '')}")
#         else:
#             if message.type == 'human':
#                 formatted.append(f"Human: {message.content}")
#             elif message.type == 'ai':
#                 formatted.append(f"Assistant: {message.content}")
#     return "\n".join(formatted)

# # Create the chain (prompt -> model) with memory
# def run_chain(question):
#     # Get memory context (previous conversations)
#     memory_variables = memory.load_memory_variables({})
#     previous_conversations = memory_variables.get("history", [])

#     # Format the previous conversations into a string
#     formatted_history = format_history(previous_conversations)

#     # Combine previous conversation with the current question
#     full_prompt = formatted_history + "\n" + template.format(question=question)
    
#     # Invoke the model with the full prompt (as a string)
#     answer = model(full_prompt)
    
#     # Save the current question and answer to memory
#     memory.save_context({"input": question}, {"output": answer})
    
#     return answer

# # Input field for user to add tasks
# question = st.chat_input("Add your tasks...")

# # When the user submits a question
# if question:
#     response = run_chain(question)
#     st.write(response)

# # Show conversation history
# st.write("Conversation History:")
# memory_variables = memory.load_memory_variables({})
# st.write(format_history(memory_variables.get("history", [])))


# I want you to create a timetable for me.
# Working hours : 9:00am to 4:00pm
# Playing hours : 6:00 pm to 8:00pm
# I want atleast 7hrs of sleep.
# My tasks
# Task A (deadline is tomorrow) : will take 4hrs
# Task B (deadline is today) : will take 3 hrs
# Task C (deadline is today) : will take 2 hrs
# Task D (deadline is tomorrow) : will take 3 hrs
# I want regular short breaks in between
# I have to play badminton for 2 hrs
# I need to do running for 30mins
# I also need breaks for meals.

from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from langchain.memory import ConversationBufferMemory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import streamlit as st

st.title("Plan your Day!!")

if 'memory' not in st.session_state:
    st.session_state.memory = ConversationBufferMemory(return_messages=True)

template = """
Question: {question}
Answer: Let's think step by step.
"""

# Create the prompt template
prompt = ChatPromptTemplate.from_template(template)

# Load the model
model = OllamaLLM(model="llama3")

# Helper function to format the conversation history
def format_history(messages):
    formatted = []
    for message in messages:
        if message.type == 'human':
            formatted.append(f"Human: {message.content}")
        elif message.type == 'ai':
            formatted.append(f"Assistant: {message.content}")
    return "\n".join(formatted)

# Create the chain (prompt -> model) with memory
def run_chain(question):
    # Get memory context (previous conversations)
    memory_variables = st.session_state.memory.load_memory_variables({})
    previous_conversations = memory_variables.get("history", [])

    # Format the previous conversations into a string
    formatted_history = format_history(previous_conversations)

    # Create the chain
    chain = (
        {"question": RunnablePassthrough(), "history": lambda _: formatted_history}
        | prompt
        | model
        | StrOutputParser()
    )
    
    # Invoke the chain
    answer = chain.invoke(question)
    
    # Save the current question and answer to memory
    st.session_state.memory.save_context({"input": question}, {"output": answer})
    
    return answer

# Input field for user to add tasks
question = st.chat_input("Add your tasks...")

# When the user submits a question
if question:
    response = run_chain(question)
    st.write(response)

# Show conversation history
st.write("Conversation History:")
memory_variables = st.session_state.memory.load_memory_variables({})
st.write(format_history(memory_variables.get("history", [])))

# Add a button to clear the memory
if st.button("Clear Memory"):
    st.session_state.memory.clear()
    st.success("Memory cleared!")